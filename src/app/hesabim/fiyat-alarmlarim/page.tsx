import Link from "next/link";
import { Bell, Trash2, CheckCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatPrice, formatDate } from "@/lib/format";

async function getPriceAlerts(userId: string) {
  return prisma.priceAlert.findMany({
    where: { userId },
    include: {
      product: {
        include: { brand: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function FiyatAlarmlarimPage() {
  const session = await auth();
  if (!session?.user) return null;

  const alerts = await getPriceAlerts(session.user.id);
  const activeAlerts = alerts.filter((a) => a.isActive && !a.isTriggered);
  const triggeredAlerts = alerts.filter((a) => a.isTriggered);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fiyat Alarmlarım</h1>
          <p className="text-muted-foreground">
            {activeAlerts.length} aktif alarm
          </p>
        </div>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-6">
          {/* Active Alerts */}
          {activeAlerts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Aktif Alarmlar</h2>
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <Card key={alert.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-3xl">🍾</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/urunler/${alert.product.slug}`}
                          className="font-medium hover:underline line-clamp-1"
                        >
                          {alert.product.name}
                        </Link>
                        {alert.product.brand && (
                          <p className="text-sm text-muted-foreground">
                            {alert.product.brand.name}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm">
                            Şu anki fiyat:{" "}
                            <strong>
                              {formatPrice(alert.product.currentPrice)}
                            </strong>
                          </span>
                          <span className="text-sm text-muted-foreground">
                            → Hedef:{" "}
                            <strong>{formatPrice(alert.targetPrice)}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={alert.isActive} />
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Triggered Alerts */}
          {triggeredAlerts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Tetiklenen Alarmlar
                <Badge variant="success" className="ml-2">
                  {triggeredAlerts.length}
                </Badge>
              </h2>
              <div className="space-y-3">
                {triggeredAlerts.map((alert) => (
                  <Card key={alert.id} className="border-green-500/50">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="h-16 w-16 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/urunler/${alert.product.slug}`}
                          className="font-medium hover:underline line-clamp-1"
                        >
                          {alert.product.name}
                        </Link>
                        <p className="text-sm text-green-600">
                          Hedef fiyata ulaştı!
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm">
                            Şu anki fiyat:{" "}
                            <strong>
                              {formatPrice(alert.product.currentPrice)}
                            </strong>
                          </span>
                          {alert.triggeredAt && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(alert.triggeredAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Henüz fiyat alarmınız yok
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Ürün sayfalarından fiyat alarmı kurarak fiyat düşüşlerinden
              haberdar olabilirsiniz.
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
