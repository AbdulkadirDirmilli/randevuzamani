import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate, calculateDiscountPercentage } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BreadcrumbLd } from "@/components/seo/json-ld";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Tag,
  Flame,
  Sparkles,
  Package,
  ChevronRight,
} from "lucide-react";

const CAMPAIGN_TYPE_CONFIG = {
  SEASONAL: { label: "Sezonluk", icon: Calendar, color: "bg-blue-500" },
  FLASH_SALE: { label: "Flaş Satış", icon: Flame, color: "bg-red-500" },
  CLEARANCE: { label: "Stok Eritme", icon: Package, color: "bg-orange-500" },
  SPECIAL: { label: "Özel", icon: Sparkles, color: "bg-purple-500" },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCampaign(slug: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: {
      products: {
        include: {
          product: {
            include: {
              brand: true,
              category: true,
            },
          },
        },
      },
    },
  });

  return campaign;
}

function getRemainingTime(endDate: Date): { text: string; isUrgent: boolean } {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { text: "Sona erdi", isUrgent: false };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return { text: `${days} gün ${hours} saat`, isUrgent: days < 2 };
  }
  if (hours > 0) {
    return { text: `${hours} saat ${minutes} dakika`, isUrgent: true };
  }
  return { text: `${minutes} dakika`, isUrgent: true };
}

function getCampaignStatus(startDate: Date, endDate: Date): "upcoming" | "active" | "ended" {
  const now = new Date();
  if (now < startDate) return "upcoming";
  if (now > endDate) return "ended";
  return "active";
}

export default async function KampanyaDetayPage({ params }: PageProps) {
  const { slug } = await params;
  const campaign = await getCampaign(slug);

  if (!campaign) {
    notFound();
  }

  const config = CAMPAIGN_TYPE_CONFIG[campaign.type as keyof typeof CAMPAIGN_TYPE_CONFIG] || CAMPAIGN_TYPE_CONFIG.SPECIAL;
  const Icon = config.icon;
  const status = getCampaignStatus(campaign.startDate, campaign.endDate);
  const remainingTime = status === "active" ? getRemainingTime(campaign.endDate) : null;

  const breadcrumbs = [
    { name: "Ana Sayfa", url: "/" },
    { name: "Kampanyalar", url: "/kampanyalar" },
    { name: campaign.name, url: `/kampanyalar/${campaign.slug}` },
  ];

  return (
    <>
      <BreadcrumbLd items={breadcrumbs} />

      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Ana Sayfa</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/kampanyalar" className="hover:text-foreground">Kampanyalar</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{campaign.name}</span>
        </nav>

        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/kampanyalar">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tüm Kampanyalar
          </Link>
        </Button>

        {/* Campaign Header */}
        <div className={`rounded-xl p-8 mb-8 ${
          status === "ended" ? "bg-muted" : "bg-gradient-to-r from-primary/10 to-primary/5"
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${config.color} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <Badge variant="outline" className="mb-1">
                    {config.label}
                  </Badge>
                  {campaign.isFeatured && (
                    <Badge className="ml-2">Öne Çıkan</Badge>
                  )}
                </div>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold">{campaign.name}</h1>

              {campaign.description && (
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {campaign.description}
                </p>
              )}

              {/* Date Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                  </span>
                </div>
                {remainingTime && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    remainingTime.isUrgent ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                  }`}>
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Kalan: {remainingTime.text}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Discount Badge */}
            <div className="text-center lg:text-right">
              {status === "ended" ? (
                <Badge variant="secondary" className="text-xl px-6 py-3">
                  Kampanya Sona Erdi
                </Badge>
              ) : status === "upcoming" ? (
                <Badge variant="outline" className="text-xl px-6 py-3">
                  Yakında Başlıyor
                </Badge>
              ) : (
                <div className="inline-block bg-destructive text-destructive-foreground rounded-xl px-6 py-4">
                  <div className="text-4xl font-bold">
                    {campaign.discountType === "PERCENTAGE"
                      ? `%${campaign.discountValue}`
                      : formatPrice(campaign.discountValue)
                    }
                  </div>
                  <div className="text-sm opacity-90">İndirim</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              Kampanya Ürünleri
              <Badge variant="secondary" className="ml-2">
                {campaign.products.length} ürün
              </Badge>
            </h2>
          </div>

          {campaign.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {campaign.products.map(({ product, customDiscount }) => {
                // İndirimli fiyatı hesapla
                const discountValue = customDiscount ?? campaign.discountValue;
                const discountedPrice = campaign.discountType === "PERCENTAGE"
                  ? product.currentPrice * (1 - discountValue / 100)
                  : product.currentPrice - discountValue;
                const finalPrice = Math.max(0, discountedPrice);
                const discountPercent = calculateDiscountPercentage(product.currentPrice, finalPrice);

                return (
                  <Link key={product.id} href={`/urunler/${product.slug}`}>
                    <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                      <CardContent className="p-4">
                        {/* Discount Badge */}
                        <div className="relative">
                          <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 z-10"
                          >
                            %{discountPercent}
                          </Badge>
                          <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                            <span className="text-6xl">🍾</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {product.brand && (
                            <span className="text-xs text-muted-foreground">
                              {product.brand.name}
                            </span>
                          )}

                          <h3 className="font-medium line-clamp-2 min-h-[2.5rem]">
                            {product.name}
                          </h3>

                          {product.category && (
                            <Badge variant="secondary" className="text-xs">
                              {product.category.name}
                            </Badge>
                          )}

                          <div className="pt-2 space-y-1">
                            <div className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.currentPrice)}
                            </div>
                            <div className="text-xl font-bold text-green-600">
                              {formatPrice(finalPrice)}
                            </div>
                          </div>

                          {customDiscount && (
                            <Badge variant="outline" className="text-xs">
                              Özel indirim: %{customDiscount}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Henüz Ürün Eklenmemiş</h3>
              <p className="text-muted-foreground">
                Bu kampanyaya henüz ürün eklenmemiş.
              </p>
            </div>
          )}
        </div>

        {/* Other Campaigns CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Diğer kampanyaları da incelemek ister misiniz?
          </p>
          <Button asChild variant="outline">
            <Link href="/kampanyalar">
              Tüm Kampanyaları Gör
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const campaign = await getCampaign(slug);

  if (!campaign) {
    return {
      title: "Kampanya Bulunamadı | Fiyat Takip",
    };
  }

  const discountText = campaign.discountType === "PERCENTAGE"
    ? `%${campaign.discountValue} İndirim`
    : `${campaign.discountValue} TL İndirim`;

  return {
    title: `${campaign.name} - ${discountText} | Fiyat Takip`,
    description: campaign.description || `${campaign.name} kampanyası ile ${discountText} fırsatını kaçırmayın!`,
    openGraph: {
      title: `${campaign.name} - ${discountText}`,
      description: campaign.description || `${discountText} fırsatını kaçırmayın!`,
      images: campaign.bannerImage ? [campaign.bannerImage] : undefined,
    },
  };
}
