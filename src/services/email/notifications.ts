import { prisma } from "@/lib/prisma";
import {
  sendEmail,
  getPriceDropEmailHtml,
  getPriceAlertEmailHtml,
  getCampaignEmailHtml,
  getWelcomeEmailHtml,
} from "./resend";

/**
 * Fiyat düşüşü email bildirimi gönderir
 */
export async function sendPriceDropEmails(
  productId: string,
  productName: string,
  productSlug: string,
  oldPrice: number,
  newPrice: number
) {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // Bu ürünü favorilere eklemiş kullanıcıları bul
    const favorites = await prisma.favorite.findMany({
      where: { productId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    for (const favorite of favorites) {
      try {
        const html = getPriceDropEmailHtml(
          favorite.user.name || "",
          productName,
          oldPrice,
          newPrice,
          productSlug
        );

        const result = await sendEmail({
          to: favorite.user.email,
          subject: `Fiyat Düştü: ${productName}`,
          html,
        });

        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push(`User ${favorite.user.id}: ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(
          `User ${favorite.user.id}: ${error instanceof Error ? error.message : "Unknown"}`
        );
      }
    }
  } catch (error) {
    results.errors.push(
      `Global error: ${error instanceof Error ? error.message : "Unknown"}`
    );
  }

  return results;
}

/**
 * Fiyat alarmı tetikleme email bildirimi gönderir
 */
export async function sendPriceAlertEmail(
  userId: string,
  productName: string,
  productSlug: string,
  targetPrice: number,
  currentPrice: number
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const html = getPriceAlertEmailHtml(
      user.name || "",
      productName,
      targetPrice,
      currentPrice,
      productSlug
    );

    return sendEmail({
      to: user.email,
      subject: `Fiyat Alarmı: ${productName}`,
      html,
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Kampanya başlangıç email bildirimi gönderir
 */
export async function sendCampaignEmails(
  campaignId: string,
  campaignName: string,
  campaignSlug: string,
  discountValue: number,
  discountType: "PERCENTAGE" | "FIXED"
) {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // Tüm kullanıcıları al (sadece email notification açık olanlar - gelecekte eklenebilir)
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, name: true, email: true },
    });

    const discountText =
      discountType === "PERCENTAGE"
        ? `%${discountValue} İndirim`
        : `${discountValue.toLocaleString("tr-TR")} TL İndirim`;

    for (const user of users) {
      try {
        const html = getCampaignEmailHtml(
          user.name || "",
          campaignName,
          discountText,
          campaignSlug
        );

        const result = await sendEmail({
          to: user.email,
          subject: `Yeni Kampanya: ${campaignName}`,
          html,
        });

        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push(`User ${user.id}: ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(
          `User ${user.id}: ${error instanceof Error ? error.message : "Unknown"}`
        );
      }
    }
  } catch (error) {
    results.errors.push(
      `Global error: ${error instanceof Error ? error.message : "Unknown"}`
    );
  }

  return results;
}

/**
 * Hoş geldin email'i gönderir
 */
export async function sendWelcomeEmail(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const html = getWelcomeEmailHtml(user.name || "");

    return sendEmail({
      to: user.email,
      subject: "Fiyat Takip'e Hoş Geldiniz!",
      html,
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
