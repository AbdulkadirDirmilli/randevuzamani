import Link from "next/link";
import { ArrowRight, TrendingDown, Bell, Search, Tag, Flame, Clock, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductImage, CategoryImage } from "@/components/ui/product-image";
import { HeroSection } from "@/components/home/hero-section";
import { prisma } from "@/lib/prisma";
import { formatPrice, calculateDiscountPercentage, formatDate } from "@/lib/format";

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: { brand: true, category: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { order: "asc" },
    take: 6,
  });
}

async function getNewProducts() {
  return prisma.product.findMany({
    where: { isActive: true, isNew: true },
    include: { brand: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}

async function getActiveCampaigns() {
  const now = new Date();
  return prisma.campaign.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { endDate: "asc" }],
    take: 3,
  });
}

async function getPopularBrands() {
  return prisma.brand.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { products: { _count: "desc" } },
    take: 6,
  });
}

function getRemainingDays(endDate: Date): number {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default async function HomePage() {
  const [featuredProducts, categories, newProducts, activeCampaigns, popularBrands] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getNewProducts(),
    getActiveCampaigns(),
    getPopularBrands(),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection
        productCount={featuredProducts.length * 100}
        categoryCount={categories.length * 2}
        brandCount={popularBrands.length * 5}
      />

      {/* Features */}
      <section className="py-16 px-4 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Neden Bizi Seçmelisiniz?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Fiyat takibini kolaylaştıran özelliklerimiz
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-background to-muted/30">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Kolay Arama</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Binlerce ürün arasından aradığınızı kolayca bulun.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-background to-muted/30">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 shadow-lg">
                  <TrendingDown className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Fiyat Takibi</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Fiyat geçmişini görün, en uygun zamanı yakalayın.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-background to-muted/30">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Fiyat Alarmı</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Hedef fiyata düştüğünde anında bildirim alın.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-background to-muted/30">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                  <Tag className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Kampanyalar</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Güncel kampanyaları ve indirimleri kaçırmayın.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Kategoriler</h2>
              <p className="text-muted-foreground mt-1">Favori kategorinizi keşfedin</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/kategoriler">
                Tümünü Gör
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/urunler?category=${category.slug}`}
                className="group"
              >
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary overflow-hidden">
                  <CardContent className="p-0">
                    <CategoryImage
                      categorySlug={category.slug}
                      categoryName={category.name}
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10 relative overflow-hidden">
          {/* Decorative flames */}
          <div className="absolute top-0 right-0 text-8xl opacity-5">🔥</div>
          <div className="absolute bottom-0 left-0 text-6xl opacity-5">🔥</div>

          <div className="container mx-auto relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Flame className="h-6 w-6 text-red-500 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">Aktif Kampanyalar</h2>
                  <p className="text-muted-foreground">Kaçırmayın!</p>
                </div>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/kampanyalar">
                  Tümünü Gör
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeCampaigns.map((campaign) => {
                const remainingDays = getRemainingDays(campaign.endDate);
                return (
                  <Link key={campaign.id} href={`/kampanyalar/${campaign.slug}`}>
                    <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden border-2 border-transparent hover:border-red-500/30 group">
                      {campaign.isFeatured && (
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-center py-1.5 text-xs font-semibold uppercase tracking-wider">
                          ⭐ Öne Çıkan
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1 group-hover:text-red-500 transition-colors">{campaign.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {campaign._count.products} ürün
                            </p>
                          </div>
                          <Badge className="text-xl px-4 py-1 bg-gradient-to-r from-red-500 to-orange-500 border-0 shadow-lg">
                            {campaign.discountType === "PERCENTAGE"
                              ? `%${campaign.discountValue}`
                              : `${campaign.discountValue}₺`}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                          <Clock className={`h-4 w-4 ${remainingDays <= 2 ? "text-red-500" : "text-muted-foreground"}`} />
                          <span className={remainingDays <= 2 ? "text-red-600 font-bold animate-pulse" : "text-muted-foreground"}>
                            {remainingDays > 0 ? `${remainingDays} gün kaldı` : "🔥 Son gün!"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Popular Brands */}
      {popularBrands.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">Popüler Markalar</h2>
                  <p className="text-muted-foreground">Güvenilir markalar</p>
                </div>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/markalar">
                  Tümünü Gör
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularBrands.map((brand) => (
                <Link key={brand.id} href={`/markalar/${brand.slug}`}>
                  <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary group">
                    <CardContent className="p-5 text-center">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-14 h-14 object-contain"
                          />
                        ) : (
                          <span className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                            {brand.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{brand.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {brand._count.products} ürün
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 px-4 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Öne Çıkan Ürünler</h2>
              <p className="text-muted-foreground mt-1">En popüler ürünlerimiz</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/urunler?featured=true">
                Tümünü Gör
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/urunler/${product.slug}`}>
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group overflow-hidden">
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                      <ProductImage
                        productName={product.name}
                        categorySlug={product.category?.slug}
                        brandName={product.brand?.name}
                        images={product.images}
                        size="xl"
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      {product.brand && (
                        <span className="text-xs text-primary font-medium uppercase tracking-wide">
                          {product.brand.name}
                        </span>
                      )}
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(product.currentPrice)}
                        </span>
                        {product.discountedPrice && (
                          <>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.currentPrice)}
                            </span>
                            <Badge variant="destructive" className="text-xs animate-pulse">
                              %
                              {calculateDiscountPercentage(
                                product.currentPrice,
                                product.discountedPrice
                              )}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Yeni Eklenenler</h2>
                <p className="text-muted-foreground mt-1">En son eklenen ürünler</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/urunler?new=true">
                  Tümünü Gör
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <Link key={product.id} href={`/urunler/${product.slug}`}>
                  <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group overflow-hidden relative">
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-green-500 hover:bg-green-600 shadow-lg">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Yeni
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="aspect-square rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                        <ProductImage
                          productName={product.name}
                          categorySlug={undefined}
                          brandName={product.brand?.name}
                          images={product.images}
                          size="xl"
                          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        {product.brand && (
                          <span className="text-xs text-primary font-medium uppercase tracking-wide">
                            {product.brand.name}
                          </span>
                        )}
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(product.currentPrice)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6">
            <Bell className="h-4 w-4" />
            <span className="text-sm font-medium">Ücretsiz bildirimler</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Fiyat Düşüşlerini Kaçırmayın
          </h2>
          <p className="text-lg sm:text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Ücretsiz hesap oluşturun, favori ürünlerinizi ekleyin ve fiyat
            düştüğünde anında haberdar olun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-base px-8 shadow-xl hover:shadow-2xl transition-shadow" asChild>
              <Link href="/kayit">
                Hemen Kayıt Ol
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 border-white/30 hover:bg-white/10" asChild>
              <Link href="/urunler">
                Ürünleri İncele
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
