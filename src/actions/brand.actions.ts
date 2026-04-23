"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { brandSchema, type BrandInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";

export async function getBrands(options?: { includeInactive?: boolean }) {
  const where: Record<string, unknown> = {};

  if (!options?.includeInactive) {
    where.isActive = true;
  }

  return prisma.brand.findMany({
    where,
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getBrandById(id: string) {
  return prisma.brand.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true } },
    },
  });
}

export async function createBrand(data: BrandInput) {
  await requireAdmin();

  const validated = brandSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { slug: inputSlug, ...rest } = validated.data;
  const slug = inputSlug || slugify(rest.name);

  // Check if slug exists
  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) {
    return { error: "Bu slug zaten kullanılıyor" };
  }

  try {
    const brand = await prisma.brand.create({
      data: {
        ...rest,
        slug,
      },
    });

    revalidatePath("/admin/markalar");
    revalidatePath("/markalar");

    return { success: true, brand };
  } catch (error) {
    console.error("Create brand error:", error);
    return { error: "Marka oluşturulurken bir hata oluştu" };
  }
}

export async function updateBrand(id: string, data: Partial<BrandInput>) {
  await requireAdmin();

  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) {
    return { error: "Marka bulunamadı" };
  }

  try {
    const updated = await prisma.brand.update({
      where: { id },
      data: {
        ...data,
        slug: data.slug || (data.name ? slugify(data.name) : undefined),
      },
    });

    revalidatePath("/admin/markalar");
    revalidatePath(`/admin/markalar/${id}`);
    revalidatePath("/markalar");
    revalidatePath(`/markalar/${updated.slug}`);

    return { success: true, brand: updated };
  } catch (error) {
    console.error("Update brand error:", error);
    return { error: "Marka güncellenirken bir hata oluştu" };
  }
}

export async function deleteBrand(id: string) {
  await requireAdmin();

  // Check if brand has products
  const productCount = await prisma.product.count({
    where: { brandId: id },
  });

  if (productCount > 0) {
    return {
      error: `Bu markada ${productCount} ürün var. Önce ürünleri başka markaya taşıyın.`,
    };
  }

  try {
    await prisma.brand.delete({ where: { id } });

    revalidatePath("/admin/markalar");
    revalidatePath("/markalar");

    return { success: true };
  } catch (error) {
    console.error("Delete brand error:", error);
    return { error: "Marka silinirken bir hata oluştu" };
  }
}

export async function toggleBrandStatus(id: string) {
  await requireAdmin();

  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) {
    return { error: "Marka bulunamadı" };
  }

  try {
    await prisma.brand.update({
      where: { id },
      data: { isActive: !brand.isActive },
    });

    revalidatePath("/admin/markalar");
    revalidatePath("/markalar");

    return { success: true };
  } catch (error) {
    console.error("Toggle brand status error:", error);
    return { error: "Durum değiştirilirken bir hata oluştu" };
  }
}
