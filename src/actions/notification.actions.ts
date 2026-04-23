"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export type NotificationType = "PRICE_DROP" | "PRICE_ALERT" | "CAMPAIGN" | "SYSTEM";

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function getUserNotifications(limit = 20) {
  const user = await requireAuth();

  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadNotificationCount() {
  const user = await requireAuth();

  return prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });
}

export async function markNotificationAsRead(notificationId: string) {
  const user = await requireAuth();

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== user.id) {
    return { error: "Bildirim bulunamadı" };
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  revalidatePath("/hesabim/bildirimler");
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const user = await requireAuth();

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/hesabim/bildirimler");
  return { success: true };
}

export async function deleteNotification(notificationId: string) {
  const user = await requireAuth();

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== user.id) {
    return { error: "Bildirim bulunamadı" };
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  revalidatePath("/hesabim/bildirimler");
  return { success: true };
}

export async function deleteAllNotifications() {
  const user = await requireAuth();

  await prisma.notification.deleteMany({
    where: { userId: user.id },
  });

  revalidatePath("/hesabim/bildirimler");
  return { success: true };
}

// Admin/System functions to create notifications
export async function createNotification(data: CreateNotificationData) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || null,
    },
  });
}

export async function createBulkNotifications(
  userIds: string[],
  data: Omit<CreateNotificationData, "userId">
) {
  return prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || null,
    })),
  });
}

// Notify users about price drop
export async function notifyPriceDrop(
  productId: string,
  productName: string,
  oldPrice: number,
  newPrice: number
) {
  // Find users who have this product in favorites
  const favorites = await prisma.favorite.findMany({
    where: { productId },
    select: { userId: true },
  });

  if (favorites.length === 0) return;

  const userIds = favorites.map((f) => f.userId);
  const percentDrop = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

  await createBulkNotifications(userIds, {
    type: "PRICE_DROP",
    title: "Fiyat Düştü!",
    message: `${productName} ürününün fiyatı %${percentDrop} düştü! Yeni fiyat: ${newPrice.toLocaleString("tr-TR")} TL`,
    link: `/urunler/${productId}`,
  });
}

// Notify user about triggered price alert
export async function notifyPriceAlert(
  userId: string,
  productId: string,
  productName: string,
  targetPrice: number,
  currentPrice: number
) {
  await createNotification({
    userId,
    type: "PRICE_ALERT",
    title: "Fiyat Alarmı Tetiklendi!",
    message: `${productName} ürünü hedef fiyatınız olan ${targetPrice.toLocaleString("tr-TR")} TL'nin altına düştü! Güncel fiyat: ${currentPrice.toLocaleString("tr-TR")} TL`,
    link: `/urunler/${productId}`,
  });
}

// Notify users about new campaign
export async function notifyCampaignStart(
  campaignId: string,
  campaignName: string,
  discountValue: number,
  discountType: "PERCENTAGE" | "FIXED"
) {
  // Get all active users
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: { id: true },
  });

  if (users.length === 0) return;

  const userIds = users.map((u) => u.id);
  const discountText =
    discountType === "PERCENTAGE"
      ? `%${discountValue} indirim`
      : `${discountValue.toLocaleString("tr-TR")} TL indirim`;

  await createBulkNotifications(userIds, {
    type: "CAMPAIGN",
    title: "Yeni Kampanya!",
    message: `${campaignName} kampanyası başladı! ${discountText} fırsatını kaçırmayın.`,
    link: `/kampanyalar/${campaignId}`,
  });
}

// System notification for all users
export async function notifySystemMessage(title: string, message: string, link?: string) {
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  if (users.length === 0) return;

  const userIds = users.map((u) => u.id);

  await createBulkNotifications(userIds, {
    type: "SYSTEM",
    title,
    message,
    link,
  });
}
