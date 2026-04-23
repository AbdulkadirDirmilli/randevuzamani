"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const campaignSchema = z.object({
  name: z.string().min(2, "Kampanya adı en az 2 karakter olmalı"),
  description: z.string().optional(),
  type: z.enum(["SEASONAL", "FLASH_SALE", "CLEARANCE", "SPECIAL"]),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().min(0, "İndirim değeri 0'dan küçük olamaz"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  image: z.string().optional(),
  bannerImage: z.string().optional(),
});

export async function getCampaigns() {
  return prisma.campaign.findMany({
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCampaign(id: string) {
  return prisma.campaign.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: {
            include: {
              brand: true,
              category: true,
            },
          },
        },
      },
    },
  });
}

export async function getActiveCampaigns() {
  const now = new Date();
  return prisma.campaign.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { endDate: "asc" },
  });
}

export async function createCampaign(formData: FormData) {
  await requireAdmin();

  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    type: formData.get("type") as string,
    discountType: formData.get("discountType") as string,
    discountValue: parseFloat(formData.get("discountValue") as string),
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    isActive: formData.get("isActive") === "true",
    isFeatured: formData.get("isFeatured") === "true",
    image: (formData.get("image") as string) || undefined,
    bannerImage: (formData.get("bannerImage") as string) || undefined,
  };

  const validated = campaignSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const data = validated.data;
  const slug = slugify(data.name);

  const existing = await prisma.campaign.findUnique({ where: { slug } });
  if (existing) {
    return { error: "Bu isimde bir kampanya zaten var" };
  }

  try {
    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        type: data.type,
        discountType: data.discountType,
        discountValue: data.discountValue,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        image: data.image || null,
        bannerImage: data.bannerImage || null,
      },
    });

    revalidatePath("/admin/kampanyalar");
    return { success: true, campaign };
  } catch (error) {
    console.error("Campaign creation error:", error);
    return { error: "Kampanya oluşturulamadı" };
  }
}

export async function updateCampaign(id: string, formData: FormData) {
  await requireAdmin();

  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    type: formData.get("type") as string,
    discountType: formData.get("discountType") as string,
    discountValue: parseFloat(formData.get("discountValue") as string),
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    isActive: formData.get("isActive") === "true",
    isFeatured: formData.get("isFeatured") === "true",
    image: (formData.get("image") as string) || undefined,
    bannerImage: (formData.get("bannerImage") as string) || undefined,
  };

  const validated = campaignSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const data = validated.data;
  const slug = slugify(data.name);

  const existing = await prisma.campaign.findFirst({
    where: { slug, NOT: { id } },
  });
  if (existing) {
    return { error: "Bu isimde bir kampanya zaten var" };
  }

  try {
    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        type: data.type,
        discountType: data.discountType,
        discountValue: data.discountValue,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        image: data.image || null,
        bannerImage: data.bannerImage || null,
      },
    });

    revalidatePath("/admin/kampanyalar");
    revalidatePath(`/admin/kampanyalar/${id}`);
    return { success: true, campaign };
  } catch (error) {
    console.error("Campaign update error:", error);
    return { error: "Kampanya güncellenemedi" };
  }
}

export async function deleteCampaign(id: string) {
  await requireAdmin();

  try {
    await prisma.campaign.delete({ where: { id } });
    revalidatePath("/admin/kampanyalar");
    return { success: true };
  } catch (error) {
    console.error("Campaign deletion error:", error);
    return { error: "Kampanya silinemedi" };
  }
}

export async function toggleCampaignStatus(id: string) {
  await requireAdmin();

  try {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      return { error: "Kampanya bulunamadı" };
    }

    await prisma.campaign.update({
      where: { id },
      data: { isActive: !campaign.isActive },
    });

    revalidatePath("/admin/kampanyalar");
    return { success: true };
  } catch (error) {
    console.error("Campaign status toggle error:", error);
    return { error: "Durum değiştirilemedi" };
  }
}

export async function addProductsToCampaign(
  campaignId: string,
  productIds: string[],
  customDiscount?: number
) {
  await requireAdmin();

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      return { error: "Kampanya bulunamadı" };
    }

    // Filter out products already in the campaign
    const existingProducts = await prisma.campaignProduct.findMany({
      where: { campaignId, productId: { in: productIds } },
      select: { productId: true },
    });
    const existingProductIds = new Set(existingProducts.map((p) => p.productId));
    const newProductIds = productIds.filter((id) => !existingProductIds.has(id));

    if (newProductIds.length === 0) {
      return { error: "Seçilen ürünler zaten kampanyada" };
    }

    await prisma.campaignProduct.createMany({
      data: newProductIds.map((productId) => ({
        campaignId,
        productId,
        customDiscount: customDiscount ?? null,
      })),
    });

    revalidatePath(`/admin/kampanyalar/${campaignId}`);
    return { success: true, added: newProductIds.length };
  } catch (error) {
    console.error("Add products to campaign error:", error);
    return { error: "Ürünler eklenemedi" };
  }
}

export async function removeProductFromCampaign(
  campaignId: string,
  productId: string
) {
  await requireAdmin();

  try {
    await prisma.campaignProduct.deleteMany({
      where: { campaignId, productId },
    });

    revalidatePath(`/admin/kampanyalar/${campaignId}`);
    return { success: true };
  } catch (error) {
    console.error("Remove product from campaign error:", error);
    return { error: "Ürün çıkarılamadı" };
  }
}

export async function updateCampaignProductDiscount(
  campaignId: string,
  productId: string,
  customDiscount: number | null
) {
  await requireAdmin();

  try {
    await prisma.campaignProduct.updateMany({
      where: { campaignId, productId },
      data: { customDiscount },
    });

    revalidatePath(`/admin/kampanyalar/${campaignId}`);
    return { success: true };
  } catch (error) {
    console.error("Update campaign product discount error:", error);
    return { error: "İndirim güncellenemedi" };
  }
}

export async function getProductsForCampaign(search?: string, limit = 20) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { barcode: { contains: search } },
          { sku: { contains: search } },
        ],
      }),
    },
    include: {
      brand: true,
      category: true,
    },
    orderBy: { name: "asc" },
    take: limit,
  });
}
