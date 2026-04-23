import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Tag,
  Percent,
  ArrowRight,
  Clock,
  Flame,
  Sparkles,
  Package
} from "lucide-react";

const CAMPAIGN_TYPE_CONFIG = {
  SEASONAL: { label: "Sezonluk", icon: Calendar, color: "bg-blue-500" },
  FLASH_SALE: { label: "Flaş Satış", icon: Flame, color: "bg-red-500" },
  CLEARANCE: { label: "Stok Eritme", icon: Package, color: "bg-orange-500" },
  SPECIAL: { label: "Özel", icon: Sparkles, color: "bg-purple-500" },
};

async function getActiveCampaigns() {
  const now = new Date();

  const campaigns = await prisma.campaign.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      products: {
        include: {
          product: {
            include: { brand: true },
          },
        },
        take: 4,
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: [
      { isFeatured: "desc" },
      { endDate: "asc" },
    ],
  });

  return campaigns;
}

async function getUpcomingCampaigns() {
  const now = new Date();

  const campaigns = await prisma.campaign.findMany({
    where: {
      isActive: true,
      startDate: { gt: now },
    },
    orderBy: { startDate: "asc" },
    take: 3,
  });

  return campaigns;
}

function getRemainingTime(endDate: Date): string {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} gün ${hours} saat`;
  }
  return `${hours} saat`;
}

export default async function KampanyalarPage() {
  const [activeCampaigns, upcomingCampaigns] = await Promise.all([
    getActiveCampaigns(),
    getUpcomingCampaigns(),
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Kampanyalar</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          En güncel indirimler ve fırsatları kaçırmayın.
          Favori ürünlerinizi takip edin, fiyat düştüğünde haberdar olun.
        </p>
      </div>

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 ? (
        <div className="space-y-8 mb-16">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-semibold">Aktif Kampanyalar</h2>
            <Badge variant="secondary">{activeCampaigns.length}</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeCampaigns.map((campaign) => {
              const config = CAMPAIGN_TYPE_CONFIG[campaign.type as keyof typeof CAMPAIGN_TYPE_CONFIG] || CAMPAIGN_TYPE_CONFIG.SPECIAL;
              const Icon = config.icon;

              return (
                <Card key={campaign.id} className={`overflow-hidden ${campaign.isFeatured ? "ring-2 ring-primary" : ""}`}>
                  {campaign.isFeatured && (
                    <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                      Öne Çıkan Kampanya
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${config.color} text-white`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-1">
                            {config.label}
                          </Badge>
                          <CardTitle className="text-xl">{campaign.name}</CardTitle>
                        </div>
                      </div>
                      <Badge className="text-lg px-3 py-1" variant="destructive">
                        {campaign.discountType === "PERCENTAGE"
                          ? `%${campaign.discountValue}`
                          : formatPrice(campaign.discountValue)
                        }
                        {campaign.discountType === "PERCENTAGE" ? " İndirim" : " İndirim"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {campaign.description && (
                      <p className="text-muted-foreground line-clamp-2">
                        {campaign.description}
                      </p>
                    )}

                    {/* Countdown */}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Kalan süre:</span>
                      <span className="font-semibold text-orange-600">
                        {getRemainingTime(campaign.endDate)}
                      </span>
                    </div>

                    {/* Products Preview */}
                    {campaign.products.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {campaign._count.products} ürün bu kampanyada
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {campaign.products.map(({ product }) => (
                            <Link
                              key={product.id}
                              href={`/urunler/${product.slug}`}
                              className="flex-shrink-0"
                            >
                              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-3xl hover:bg-muted/80 transition-colors">
                                🍾
                              </div>
                              <p className="text-xs text-center mt-1 truncate w-20">
                                {product.name}
                              </p>
                            </Link>
                          ))}
                          {campaign._count.products > 4 && (
                            <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                              +{campaign._count.products - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Date Range */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                      </span>
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/kampanyalar/${campaign.slug}`}>
                        Kampanyayı İncele
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/50 rounded-lg mb-16">
          <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Aktif Kampanya Yok</h3>
          <p className="text-muted-foreground mb-4">
            Şu anda aktif kampanya bulunmuyor. Yakında yeni kampanyalar için takipte kalın!
          </p>
          <Button asChild variant="outline">
            <Link href="/urunler">Tüm Ürünleri Gör</Link>
          </Button>
        </div>
      )}

      {/* Upcoming Campaigns */}
      {upcomingCampaigns.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <h2 className="text-2xl font-semibold">Yaklaşan Kampanyalar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingCampaigns.map((campaign) => {
              const config = CAMPAIGN_TYPE_CONFIG[campaign.type as keyof typeof CAMPAIGN_TYPE_CONFIG] || CAMPAIGN_TYPE_CONFIG.SPECIAL;

              return (
                <Card key={campaign.id} className="opacity-80">
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2">
                      {config.label}
                    </Badge>
                    <h3 className="font-semibold mb-2">{campaign.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>Başlangıç: {formatDate(campaign.startDate)}</span>
                    </div>
                    <Badge variant="secondary">
                      {campaign.discountType === "PERCENTAGE"
                        ? `%${campaign.discountValue} İndirim`
                        : `${formatPrice(campaign.discountValue)} İndirim`
                      }
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-16 bg-muted/30 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4 text-center">
          Kampanyalardan Nasıl Haberdar Olurum?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium mb-1">Favorilere Ekle</h4>
            <p className="text-sm text-muted-foreground">
              İlgilendiğiniz ürünleri favorilere ekleyin
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Percent className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium mb-1">Fiyat Alarmı Kur</h4>
            <p className="text-sm text-muted-foreground">
              Hedef fiyat belirleyin, düşünce bildirim alın
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium mb-1">Email Bildirimi</h4>
            <p className="text-sm text-muted-foreground">
              Yeni kampanyalardan email ile haberdar olun
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Kampanyalar | Fiyat Takip",
  description: "En güncel indirimler ve fırsatları keşfedin. Favori ürünlerinizi takip edin, fiyat düştüğünde haberdar olun.",
};
