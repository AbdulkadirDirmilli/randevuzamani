import { NextRequest, NextResponse } from "next/server";
import {
  updatePriceStats,
  calculateDiscountedPrices,
  checkPriceAlerts,
  checkPriceDrops,
  cleanupOldNotifications,
  notifyNewCampaigns,
  deactivateExpiredCampaigns,
} from "@/services/cron";

// Cron job güvenliği için secret key
const CRON_SECRET = process.env.CRON_SECRET || "your-cron-secret-key";

type CronTask =
  | "price-stats"
  | "discounted-prices"
  | "price-alerts"
  | "price-drops"
  | "cleanup-notifications"
  | "new-campaigns"
  | "expire-campaigns"
  | "all";

export async function GET(request: NextRequest) {
  // Secret key kontrolü
  const authHeader = request.headers.get("authorization");
  const providedSecret = authHeader?.replace("Bearer ", "");

  if (providedSecret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const task = (searchParams.get("task") || "all") as CronTask;

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    task,
  };

  try {
    switch (task) {
      case "price-stats":
        results.priceStats = await updatePriceStats();
        break;

      case "discounted-prices":
        results.discountedPrices = await calculateDiscountedPrices();
        break;

      case "price-alerts":
        results.priceAlerts = await checkPriceAlerts();
        break;

      case "price-drops":
        results.priceDrops = await checkPriceDrops();
        break;

      case "cleanup-notifications":
        results.cleanupNotifications = await cleanupOldNotifications();
        break;

      case "new-campaigns":
        results.newCampaigns = await notifyNewCampaigns();
        break;

      case "expire-campaigns":
        results.expireCampaigns = await deactivateExpiredCampaigns();
        break;

      case "all":
      default:
        // Tüm görevleri sırayla çalıştır
        results.priceStats = await updatePriceStats();
        results.discountedPrices = await calculateDiscountedPrices();
        results.priceAlerts = await checkPriceAlerts();
        results.priceDrops = await checkPriceDrops();
        results.newCampaigns = await notifyNewCampaigns();
        results.expireCampaigns = await deactivateExpiredCampaigns();
        results.cleanupNotifications = await cleanupOldNotifications();
        break;
    }

    results.success = true;
    return NextResponse.json(results);
  } catch (error) {
    results.success = false;
    results.error = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(results, { status: 500 });
  }
}

// POST da destekle (bazı cron servisleri POST kullanır)
export async function POST(request: NextRequest) {
  return GET(request);
}
