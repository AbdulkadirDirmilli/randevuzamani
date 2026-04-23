import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Bell, Package } from "lucide-react";
import { formatDate } from "@/lib/format";

async function getUserStats(userId: string) {
  const [favoriteCount, alertCount, triggeredAlertCount] = await Promise.all([
    prisma.favorite.count({ where: { userId } }),
    prisma.priceAlert.count({ where: { userId, isActive: true } }),
    prisma.priceAlert.count({ where: { userId, isTriggered: true } }),
  ]);

  return { favoriteCount, alertCount, triggeredAlertCount };
}

export default async function HesabimPage() {
  const session = await auth();
  if (!session?.user) return null;

  const stats = await getUserStats(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hesabım</h1>
        <p className="text-muted-foreground">
          Hoş geldiniz, {session.user.name || session.user.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorilerim</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favoriteCount}</div>
            <p className="text-xs text-muted-foreground">Kayıtlı ürün</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktif Alarmlar
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.alertCount}</div>
            <p className="text-xs text-muted-foreground">Fiyat takibinde</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tetiklenen Alarmlar
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.triggeredAlertCount}</div>
            <p className="text-xs text-muted-foreground">Hedef fiyata ulaştı</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Hesap Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Ad Soyad</dt>
              <dd className="font-medium">{session.user.name || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">E-posta</dt>
              <dd className="font-medium">{session.user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Hesap Türü</dt>
              <dd className="font-medium">
                {session.user.role === "ADMIN" ? "Yönetici" : "Kullanıcı"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Kayıt Tarihi</dt>
              <dd className="font-medium">{formatDate(new Date())}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
