import Link from "next/link";
import { Plus, Percent, Calendar, Hash, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";

async function getDiscounts() {
  return prisma.discount.findMany({
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

function getDiscountStatus(discount: { startDate: Date; endDate: Date; isActive: boolean }) {
  const now = new Date();
  if (!discount.isActive) return { label: "Pasif", variant: "secondary" as const };
  if (now < discount.startDate) return { label: "Bekliyor", variant: "outline" as const };
  if (now > discount.endDate) return { label: "Sona Erdi", variant: "destructive" as const };
  return { label: "Aktif", variant: "success" as const };
}

function getDiscountTypeLabel(type: string) {
  const labels: Record<string, string> = {
    PERCENTAGE: "Yüzde",
    FIXED: "Sabit Tutar",
    BUY_X_GET_Y: "X Al Y Öde",
  };
  return labels[type] || type;
}

export default async function AdminIndirimlerPage() {
  const discounts = await getDiscounts();

  const activeDiscounts = discounts.filter((d) => {
    const now = new Date();
    return d.isActive && now >= d.startDate && now <= d.endDate;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">İndirimler</h1>
          <p className="text-muted-foreground">
            {activeDiscounts} aktif indirim
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/indirimler/yeni">
            <Plus className="h-4 w-4 mr-2" />
            Yeni İndirim
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discounts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeDiscounts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kuponlu</CardTitle>
            <Hash className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {discounts.filter((d) => d.code).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sona Eren</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {discounts.filter((d) => new Date() > d.endDate).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discount List */}
      {discounts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {discounts.map((discount) => {
            const status = getDiscountStatus(discount);
            return (
              <Card key={discount.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{discount.name}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <Badge variant="outline">{getDiscountTypeLabel(discount.type)}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {discount.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {discount.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <div className="flex items-center gap-1">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {discount.type === "PERCENTAGE"
                          ? `%${discount.value}`
                          : formatPrice(discount.value)}
                      </span>
                    </div>
                    {discount.code && (
                      <div className="flex items-center gap-1">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <code className="bg-muted px-1 rounded text-xs">{discount.code}</code>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span>{discount.products.length} ürün</span>
                    </div>
                  </div>

                  {discount.usageLimit && (
                    <div className="text-xs text-muted-foreground">
                      Kullanım: {discount.usageCount} / {discount.usageLimit}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Başlangıç:</span>
                      <span>{formatDate(discount.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bitiş:</span>
                      <span>{formatDate(discount.endDate)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Percent className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Henüz indirim yok</h3>
            <p className="text-muted-foreground text-center mb-4">
              İlk indirimi oluşturarak ürünlerinize özel fiyatlar tanımlayın.
            </p>
            <Button asChild>
              <Link href="/admin/indirimler/yeni">
                <Plus className="h-4 w-4 mr-2" />
                İlk İndirimi Oluştur
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
