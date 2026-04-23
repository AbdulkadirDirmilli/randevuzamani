import { prisma } from "@/lib/prisma";

/**
 * Ürün fiyat istatistiklerini günceller
 * - En düşük fiyat (lowestPrice)
 * - En yüksek fiyat (highestPrice)
 * - Fiyat ortalaması hesaplama
 */
export async function updatePriceStats() {
  const results = {
    processed: 0,
    updated: 0,
    errors: [] as string[],
  };

  try {
    // Tüm aktif ürünleri al
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, currentPrice: true, minPrice: true, maxPrice: true },
    });

    for (const product of products) {
      try {
        // Ürünün fiyat geçmişini al
        const priceHistory = await prisma.priceHistory.findMany({
          where: { productId: product.id },
          select: { price: true },
        });

        if (priceHistory.length === 0) continue;

        const prices = priceHistory.map((h) => h.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        // Sadece değişiklik varsa güncelle
        if (product.minPrice !== minPrice || product.maxPrice !== maxPrice) {
          await prisma.product.update({
            where: { id: product.id },
            data: { minPrice, maxPrice },
          });
          results.updated++;
        }

        results.processed++;
      } catch (error) {
        results.errors.push(
          `Product ${product.id}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  } catch (error) {
    results.errors.push(
      `Global error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  return results;
}

/**
 * İndirimli fiyatları hesaplar ve günceller
 * - Aktif kampanyalardaki ürünlerin indirimli fiyatlarını hesaplar
 * - Süresi dolan kampanyaların indirimlerini kaldırır
 */
export async function calculateDiscountedPrices() {
  const results = {
    applied: 0,
    removed: 0,
    errors: [] as string[],
  };

  const now = new Date();

  try {
    // Aktif kampanyaları al
    const activeCampaigns = await prisma.campaign.findMany({
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
    });

    // Aktif kampanyadaki ürünlerin ID'leri
    const productsInActiveCampaigns = new Set<string>();

    // Aktif kampanyalardaki ürünlere indirim uygula
    for (const campaign of activeCampaigns) {
      for (const cp of campaign.products) {
        const product = cp.product;
        productsInActiveCampaigns.add(product.id);

        const discountValue = cp.customDiscount ?? campaign.discountValue;
        let discountedPrice: number;

        if (campaign.discountType === "PERCENTAGE") {
          discountedPrice = product.currentPrice * (1 - discountValue / 100);
        } else {
          discountedPrice = product.currentPrice - discountValue;
        }

        // Negatif fiyat olmamasını sağla
        discountedPrice = Math.max(0, discountedPrice);

        // Fiyat değişikliği varsa güncelle
        if (product.discountedPrice !== discountedPrice) {
          await prisma.product.update({
            where: { id: product.id },
            data: { discountedPrice },
          });
          results.applied++;
        }
      }
    }

    // Kampanyada olmayan ürünlerin indirimli fiyatını kaldır
    const productsWithDiscounts = await prisma.product.findMany({
      where: {
        discountedPrice: { not: null },
        id: { notIn: Array.from(productsInActiveCampaigns) },
      },
      select: { id: true },
    });

    for (const product of productsWithDiscounts) {
      await prisma.product.update({
        where: { id: product.id },
        data: { discountedPrice: null },
      });
      results.removed++;
    }
  } catch (error) {
    results.errors.push(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  return results;
}
