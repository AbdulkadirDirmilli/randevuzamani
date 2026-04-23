import Link from "next/link";
import { Bell, TrendingDown, Target, Megaphone, Info, Trash2, CheckCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { markAllNotificationsAsRead, deleteNotification, deleteAllNotifications, markNotificationAsRead } from "@/actions/notification.actions";

async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "PRICE_DROP":
      return <TrendingDown className="h-5 w-5 text-green-500" />;
    case "PRICE_ALERT":
      return <Target className="h-5 w-5 text-blue-500" />;
    case "CAMPAIGN":
      return <Megaphone className="h-5 w-5 text-orange-500" />;
    case "SYSTEM":
    default:
      return <Info className="h-5 w-5 text-gray-500" />;
  }
}

function getNotificationTypeLabel(type: string) {
  switch (type) {
    case "PRICE_DROP":
      return "Fiyat Düşüşü";
    case "PRICE_ALERT":
      return "Fiyat Alarmı";
    case "CAMPAIGN":
      return "Kampanya";
    case "SYSTEM":
    default:
      return "Sistem";
  }
}

export default async function BildirimlerPage() {
  const session = await auth();
  if (!session?.user) return null;

  const notifications = await getNotifications(session.user.id);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bildirimlerim</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : "Tüm bildirimler okundu"}
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <form
                action={async () => {
                  "use server";
                  await markAllNotificationsAsRead();
                }}
              >
                <Button variant="outline" size="sm" type="submit">
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Tümünü Okundu İşaretle
                </Button>
              </form>
            )}
            <form
              action={async () => {
                "use server";
                await deleteAllNotifications();
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                <Trash2 className="h-4 w-4 mr-2" />
                Tümünü Sil
              </Button>
            </form>
          </div>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.isRead ? "opacity-60" : "border-primary/30"}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{notification.title}</span>
                    {!notification.isRead && (
                      <Badge variant="default" className="text-xs">Yeni</Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {getNotificationTypeLabel(notification.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </span>
                    {notification.link && (
                      <form
                        action={async () => {
                          "use server";
                          await markNotificationAsRead(notification.id);
                        }}
                      >
                        <Button variant="link" size="sm" className="h-auto p-0" asChild>
                          <Link href={notification.link}>Görüntüle</Link>
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!notification.isRead && (
                    <form
                      action={async () => {
                        "use server";
                        await markNotificationAsRead(notification.id);
                      }}
                    >
                      <Button variant="ghost" size="icon" type="submit" title="Okundu işaretle">
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    </form>
                  )}
                  <form
                    action={async () => {
                      "use server";
                      await deleteNotification(notification.id);
                    }}
                  >
                    <Button variant="ghost" size="icon" type="submit" title="Sil">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Henüz bildiriminiz yok</h3>
            <p className="text-muted-foreground text-center mb-4">
              Fiyat düşüşleri, alarm tetiklenmeleri ve kampanyalar hakkında
              burada bilgilendirileceksiniz.
            </p>
            <Button asChild>
              <Link href="/urunler">Ürünleri İncele</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
