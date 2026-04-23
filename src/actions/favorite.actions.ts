"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function getFavorites() {
  const user = await requireAuth();

  return prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: { brand: true, category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function addFavorite(productId: string) {
  const user = await requireAuth();

  // Check if already favorite
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId,
      },
    },
  });

  if (existing) {
    return { error: "Bu ürün zaten favorilerinizde" };
  }

  try {
    await prisma.favorite.create({
      data: {
        userId: user.id,
        productId,
      },
    });

    revalidatePath("/hesabim/favorilerim");

    return { success: true };
  } catch (error) {
    console.error("Add favorite error:", error);
    return { error: "Favorilere eklenirken bir hata oluştu" };
  }
}

export async function removeFavorite(productId: string) {
  const user = await requireAuth();

  try {
    await prisma.favorite.delete({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    revalidatePath("/hesabim/favorilerim");

    return { success: true };
  } catch (error) {
    console.error("Remove favorite error:", error);
    return { error: "Favorilerden çıkarılırken bir hata oluştu" };
  }
}

export async function toggleFavorite(productId: string) {
  const user = await requireAuth();

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId,
      },
    },
  });

  if (existing) {
    return removeFavorite(productId);
  } else {
    return addFavorite(productId);
  }
}

export async function isFavorite(productId: string) {
  const user = await requireAuth();

  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId,
      },
    },
  });

  return !!favorite;
}
