"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { priceAlertSchema } from "@/lib/validations";

export async function getPriceAlerts() {
  const user = await requireAuth();

  return prisma.priceAlert.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: { brand: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPriceAlert(data: {
  productId: string;
  targetPrice: number;
}) {
  const user = await requireAuth();

  const validated = priceAlertSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // Check if alert already exists for this product
  const existing = await prisma.priceAlert.findFirst({
    where: {
      userId: user.id,
      productId: data.productId,
      isActive: true,
    },
  });

  if (existing) {
    return { error: "Bu ürün için zaten aktif bir fiyat alarmınız var" };
  }

  try {
    await prisma.priceAlert.create({
      data: {
        userId: user.id,
        productId: data.productId,
        targetPrice: data.targetPrice,
      },
    });

    revalidatePath("/hesabim/fiyat-alarmlarim");

    return { success: true };
  } catch (error) {
    console.error("Create price alert error:", error);
    return { error: "Fiyat alarmı oluşturulurken bir hata oluştu" };
  }
}

export async function updatePriceAlert(
  id: string,
  data: { targetPrice?: number; isActive?: boolean }
) {
  const user = await requireAuth();

  const alert = await prisma.priceAlert.findUnique({ where: { id } });
  if (!alert || alert.userId !== user.id) {
    return { error: "Fiyat alarmı bulunamadı" };
  }

  try {
    await prisma.priceAlert.update({
      where: { id },
      data,
    });

    revalidatePath("/hesabim/fiyat-alarmlarim");

    return { success: true };
  } catch (error) {
    console.error("Update price alert error:", error);
    return { error: "Fiyat alarmı güncellenirken bir hata oluştu" };
  }
}

export async function deletePriceAlert(id: string) {
  const user = await requireAuth();

  const alert = await prisma.priceAlert.findUnique({ where: { id } });
  if (!alert || alert.userId !== user.id) {
    return { error: "Fiyat alarmı bulunamadı" };
  }

  try {
    await prisma.priceAlert.delete({ where: { id } });

    revalidatePath("/hesabim/fiyat-alarmlarim");

    return { success: true };
  } catch (error) {
    console.error("Delete price alert error:", error);
    return { error: "Fiyat alarmı silinirken bir hata oluştu" };
  }
}

export async function togglePriceAlertStatus(id: string) {
  const user = await requireAuth();

  const alert = await prisma.priceAlert.findUnique({ where: { id } });
  if (!alert || alert.userId !== user.id) {
    return { error: "Fiyat alarmı bulunamadı" };
  }

  try {
    await prisma.priceAlert.update({
      where: { id },
      data: { isActive: !alert.isActive },
    });

    revalidatePath("/hesabim/fiyat-alarmlarim");

    return { success: true };
  } catch (error) {
    console.error("Toggle price alert status error:", error);
    return { error: "Durum değiştirilirken bir hata oluştu" };
  }
}
