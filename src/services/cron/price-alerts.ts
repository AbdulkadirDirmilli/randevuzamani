import { prisma } from "@/lib/prisma";
import { notifyPriceAlert, notifyPriceDrop } from "@/actions/notification.actions";
import { sendPriceAlertEmail, sendPriceDropEmails } from "@/services/email";

/**
 * Fiyat alarmlarını kontrol eder
 * - Hedef fiyatın altına düşen ürünleri tespit eder
 * - Kullanıcılara bildirim gönderir
 * - Alarmı tetiklenmiş olarak işaretler
 */
export async function checkPriceAlerts() {
  const results = {
    checked: 0,
    triggered: 0,
    notified: 0,
    errors: [] as string[],
  };

  try {
    // Aktif ve tetiklenmemiş alarmları al
    const activeAlerts = await prisma.priceAlert.findMany({
      where: {
        isActive: true,
        isTriggered: false,
      },
      include: {
        product: true,
        user: true,
      },
    });

    results.checked = activeAlerts.length;

    for (const alert of activeAlerts) {
      try {
        const currentPrice = alert.product.discountedPrice || alert.product.currentPrice;

        // Hedef fiyatın altına düştü mü?
        if (currentPrice <= alert.targetPrice) {
          // Alarmı tetiklenmiş olarak işaretle
          await prisma.priceAlert.update({
            where: { id: alert.id },
            data: {
              isTriggered: true,
              triggeredAt: new Date(),
            },
          });

          results.triggered++;

          // Kullanıcıya bildirim gönder
          await notifyPriceAlert(
            alert.userId,
            alert.product.id,
            alert.product.name,
            alert.targetPrice,
            currentPrice
          );

          // Email gönder
          await sendPriceAlertEmail(
            alert.userId,
            alert.product.name,
            alert.product.slug,
            alert.targetPrice,
            currentPrice
          );

          results.notified++;
        }
      } catch (error) {
        results.errors.push(
          `Alert ${alert.id}: ${error instanceof Error ? error.message : "Unknown error"}`
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
 * Favori ürünlerdeki fiyat düşüşlerini tespit eder ve bildirim gönderir
 * Son 24 saat içinde fiyatı düşen ürünleri kontrol eder
 */
export async function checkPriceDrops() {
  const results = {
    checked: 0,
    dropped: 0,
    notified: 0,
    errors: [] as string[],
  };

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  try {
    // Son 24 saatte fiyat geçmişi olan ürünleri al
    const recentPriceChanges = await prisma.priceHistory.findMany({
      where: {
        createdAt: { gte: oneDayAgo },
        oldPrice: { not: null },
      },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
      distinct: ["productId"],
    });

    results.checked = recentPriceChanges.length;

    for (const priceChange of recentPriceChanges) {
      try {
        // Fiyat düştü mü?
        if (priceChange.oldPrice && priceChange.price < priceChange.oldPrice) {
          // Bu ürünü favorilerine eklemiş kullanıcıları bul
          const favorites = await prisma.favorite.findMany({
            where: { productId: priceChange.productId },
            select: { userId: true },
          });

          if (favorites.length > 0) {
            results.dropped++;

            // Toplu bildirim gönder
            await notifyPriceDrop(
              priceChange.productId,
              priceChange.product.name,
              priceChange.oldPrice,
              priceChange.price
            );

            // Email gönder
            await sendPriceDropEmails(
              priceChange.productId,
              priceChange.product.name,
              priceChange.product.slug,
              priceChange.oldPrice,
              priceChange.price
            );

            results.notified += favorites.length;
          }
        }
      } catch (error) {
        results.errors.push(
          `PriceChange ${priceChange.id}: ${error instanceof Error ? error.message : "Unknown error"}`
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
 * Eski bildirimleri temizler
 * 30 günden eski okunmuş bildirimleri siler
 */
export async function cleanupOldNotifications() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const result = await prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    return { deleted: result.count };
  } catch (error) {
    return {
      deleted: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
