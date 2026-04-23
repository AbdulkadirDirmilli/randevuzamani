"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { productSchema, type ProductInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";

export async function getProducts(options?: {
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};

  if (options?.search) {
    where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
      { sku: { contains: options.search } },
    ];
  }

  if (options?.categoryId) {
    where.categoryId = options.categoryId;
  }

  if (options?.brandId) {
    where.brandId = options.brandId;
  }

  if (options?.isActive !== undefined) {
    where.isActive = options.isActive;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { brand: true, category: true },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { brand: true, category: true, priceHistory: true },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { brand: true, category: true, priceHistory: true },
  });
}

export async function createProduct(data: ProductInput) {
  await requireAdmin();

  const validated = productSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { slug: inputSlug, ...rest } = validated.data;
  const slug = inputSlug || slugify(rest.name);

  // Check if slug exists
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return { error: "Bu slug zaten kullanılıyor" };
  }

  try {
    const product = await prisma.product.create({
      data: {
        ...rest,
        slug,
      },
    });

    // Create initial price history
    await prisma.priceHistory.create({
      data: {
        productId: product.id,
        price: product.currentPrice,
        source: "manual",
      },
    });

    revalidatePath("/admin/urunler");
    revalidatePath("/urunler");

    return { success: true, product };
  } catch (error) {
    console.error("Create product error:", error);
    return { error: "Ürün oluşturulurken bir hata oluştu" };
  }
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  await requireAdmin();

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return { error: "Ürün bulunamadı" };
  }

  try {
    const oldPrice = product.currentPrice;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        slug: data.slug || (data.name ? slugify(data.name) : undefined),
      },
    });

    // If price changed, add to history
    if (data.currentPrice && data.currentPrice !== oldPrice) {
      await prisma.priceHistory.create({
        data: {
          productId: id,
          price: data.currentPrice,
          oldPrice,
          source: "manual",
        },
      });
    }

    revalidatePath("/admin/urunler");
    revalidatePath(`/admin/urunler/${id}`);
    revalidatePath("/urunler");
    revalidatePath(`/urunler/${updated.slug}`);

    return { success: true, product: updated };
  } catch (error) {
    console.error("Update product error:", error);
    return { error: "Ürün güncellenirken bir hata oluştu" };
  }
}

export async function deleteProduct(id: string) {
  await requireAdmin();

  try {
    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/urunler");
    revalidatePath("/urunler");

    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    return { error: "Ürün silinirken bir hata oluştu" };
  }
}

export async function toggleProductStatus(id: string) {
  await requireAdmin();

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return { error: "Ürün bulunamadı" };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });

    revalidatePath("/admin/urunler");
    revalidatePath("/urunler");

    return { success: true };
  } catch (error) {
    console.error("Toggle product status error:", error);
    return { error: "Durum değiştirilirken bir hata oluştu" };
  }
}

export async function bulkUpdatePrices(
  productIds: string[],
  type: "PERCENTAGE" | "FIXED",
  value: number,
  operation: "INCREASE" | "DECREASE"
) {
  await requireAdmin();

  try {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    for (const product of products) {
      let newPrice: number;

      if (type === "PERCENTAGE") {
        const change = product.currentPrice * (value / 100);
        newPrice =
          operation === "INCREASE"
            ? product.currentPrice + change
            : product.currentPrice - change;
      } else {
        newPrice =
          operation === "INCREASE"
            ? product.currentPrice + value
            : product.currentPrice - value;
      }

      newPrice = Math.max(0, Math.round(newPrice * 100) / 100);

      await prisma.product.update({
        where: { id: product.id },
        data: { currentPrice: newPrice },
      });

      await prisma.priceHistory.create({
        data: {
          productId: product.id,
          price: newPrice,
          oldPrice: product.currentPrice,
          source: "bulk_update",
        },
      });
    }

    revalidatePath("/admin/urunler");
    revalidatePath("/urunler");

    return { success: true, updated: products.length };
  } catch (error) {
    console.error("Bulk update prices error:", error);
    return { error: "Toplu fiyat güncelleme sırasında hata oluştu" };
  }
}
