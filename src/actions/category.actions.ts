"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { categorySchema, type CategoryInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";

export async function getCategories(options?: { includeInactive?: boolean }) {
  const where: Record<string, unknown> = {};

  if (!options?.includeInactive) {
    where.isActive = true;
  }

  return prisma.category.findMany({
    where,
    include: {
      parent: true,
      _count: { select: { products: true, children: true } },
    },
    orderBy: { order: "asc" },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      _count: { select: { products: true } },
    },
  });
}

export async function createCategory(data: CategoryInput) {
  await requireAdmin();

  const validated = categorySchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { slug: inputSlug, ...rest } = validated.data;
  const slug = inputSlug || slugify(rest.name);

  // Check if slug exists
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return { error: "Bu slug zaten kullanılıyor" };
  }

  try {
    const category = await prisma.category.create({
      data: {
        ...rest,
        slug,
      },
    });

    revalidatePath("/admin/kategoriler");
    revalidatePath("/kategoriler");

    return { success: true, category };
  } catch (error) {
    console.error("Create category error:", error);
    return { error: "Kategori oluşturulurken bir hata oluştu" };
  }
}

export async function updateCategory(id: string, data: Partial<CategoryInput>) {
  await requireAdmin();

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return { error: "Kategori bulunamadı" };
  }

  // Prevent circular parent reference
  if (data.parentId === id) {
    return { error: "Kategori kendi üst kategorisi olamaz" };
  }

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...data,
        slug: data.slug || (data.name ? slugify(data.name) : undefined),
      },
    });

    revalidatePath("/admin/kategoriler");
    revalidatePath(`/admin/kategoriler/${id}`);
    revalidatePath("/kategoriler");
    revalidatePath(`/kategoriler/${updated.slug}`);

    return { success: true, category: updated };
  } catch (error) {
    console.error("Update category error:", error);
    return { error: "Kategori güncellenirken bir hata oluştu" };
  }
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  // Check if category has products
  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productCount > 0) {
    return {
      error: `Bu kategoride ${productCount} ürün var. Önce ürünleri başka kategoriye taşıyın.`,
    };
  }

  // Check if category has children
  const childCount = await prisma.category.count({
    where: { parentId: id },
  });

  if (childCount > 0) {
    return {
      error: `Bu kategorinin ${childCount} alt kategorisi var. Önce alt kategorileri silin.`,
    };
  }

  try {
    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/kategoriler");
    revalidatePath("/kategoriler");

    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return { error: "Kategori silinirken bir hata oluştu" };
  }
}

export async function toggleCategoryStatus(id: string) {
  await requireAdmin();

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return { error: "Kategori bulunamadı" };
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });

    revalidatePath("/admin/kategoriler");
    revalidatePath("/kategoriler");

    return { success: true };
  } catch (error) {
    console.error("Toggle category status error:", error);
    return { error: "Durum değiştirilirken bir hata oluştu" };
  }
}

export async function reorderCategories(
  orderedIds: { id: string; order: number }[]
) {
  await requireAdmin();

  try {
    for (const item of orderedIds) {
      await prisma.category.update({
        where: { id: item.id },
        data: { order: item.order },
      });
    }

    revalidatePath("/admin/kategoriler");
    revalidatePath("/kategoriler");

    return { success: true };
  } catch (error) {
    console.error("Reorder categories error:", error);
    return { error: "Sıralama değiştirilirken bir hata oluştu" };
  }
}
