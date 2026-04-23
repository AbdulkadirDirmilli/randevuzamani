import { prisma } from "@/lib/prisma";
import { notifyCampaignStart } from "@/actions/notification.actions";

/**
 * Yeni başlayan kampanyalar için bildirim gönderir
 * Son 1 saat içinde başlamış kampanyaları kontrol eder
 */
export async function notifyNewCampaigns() {
  const results = {
    checked: 0,
    notified: 0,
    errors: [] as string[],
  };

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  try {
    // Son 1 saat içinde başlamış aktif kampanyaları bul
    const newCampaigns = await prisma.campaign.findMany({
      where: {
        isActive: true,
        startDate: {
          gte: oneHourAgo,
          lte: now,
        },
      },
    });

    results.checked = newCampaigns.length;

    for (const campaign of newCampaigns) {
      try {
        await notifyCampaignStart(
          campaign.id,
          campaign.name,
          campaign.discountValue,
          campaign.discountType as "PERCENTAGE" | "FIXED"
        );
        results.notified++;
      } catch (error) {
        results.errors.push(
          `Campaign ${campaign.id}: ${error instanceof Error ? error.message : "Unknown error"}`
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
 * Süresi dolan kampanyaları otomatik pasife alır
 */
export async function deactivateExpiredCampaigns() {
  const results = {
    deactivated: 0,
    errors: [] as string[],
  };

  const now = new Date();

  try {
    // Süresi dolmuş aktif kampanyaları bul ve pasife al
    const result = await prisma.campaign.updateMany({
      where: {
        isActive: true,
        endDate: { lt: now },
      },
      data: { isActive: false },
    });

    results.deactivated = result.count;
  } catch (error) {
    results.errors.push(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  return results;
}

/**
 * Kampanya istatistiklerini hesaplar
 */
export async function getCampaignStats() {
  const now = new Date();

  try {
    const [total, active, upcoming, expired] = await Promise.all([
      prisma.campaign.count(),
      prisma.campaign.count({
        where: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),
      prisma.campaign.count({
        where: {
          isActive: true,
          startDate: { gt: now },
        },
      }),
      prisma.campaign.count({
        where: {
          endDate: { lt: now },
        },
      }),
    ]);

    return { total, active, upcoming, expired };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
