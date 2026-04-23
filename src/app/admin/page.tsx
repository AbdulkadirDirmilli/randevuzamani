import {
  Package,
  Users,
  TrendingUp,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

async function getStats() {
  const [
    totalProducts,
    activeProducts,
    totalUsers,
    totalCategories,
    totalBrands,
    recentProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true, brand: true },
    }),
  ]);

  return {
    totalProducts,
    activeProducts,
    totalUsers,
    totalCategories,
    totalBrands,
    recentProducts,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    {
      title: "Toplam Ürün",
      value: stats.totalProducts,
      description: `${stats.activeProducts} aktif`,
      icon: Package,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Toplam Kullanıcı",
      value: stats.totalUsers,
      description: "Kayıtlı kullanıcı",
      icon: Users,
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Kategoriler",
      value: stats.totalCategories,
      description: "Aktif kategori",
      icon: ShoppingBag,
      trend: "0%",
      trendUp: true,
    },
    {
      title: "Markalar",
      value: stats.totalBrands,
      description: "Aktif marka",
      icon: TrendingUp,
      trend: "+2%",
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Fiyat Takip yönetim paneline hoş geldiniz.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span
                  className={`flex items-center ${
                    stat.trendUp ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.trend}
                </span>
                <span className="ml-1">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Products */}
      <Card>
        <CardHeader>
          <CardTitle>Son Eklenen Ürünler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <span className="text-xl sm:text-2xl">🍾</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {product.category?.name} • {product.brand?.name}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right ml-13 sm:ml-0">
                  <p className="font-medium">
                    {formatPrice(product.currentPrice)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Stok: {product.stock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Yeni Ürün Ekle</p>
              <p className="text-sm text-muted-foreground">
                Ürün kataloğuna ekle
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Toplu Fiyat Güncelle</p>
              <p className="text-sm text-muted-foreground">
                Excel/CSV import
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Kampanya Oluştur</p>
              <p className="text-sm text-muted-foreground">
                Yeni kampanya başlat
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
