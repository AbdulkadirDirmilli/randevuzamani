import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate, calculateDiscountPercentage } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductLd, BreadcrumbLd } from "@/components/seo";
import { ProductImage } from "@/components/ui/product-image";
import {
  Heart,
  Bell,
  ChevronRight,
  TrendingDown,
  Package,
  BarChart3,
} from "lucide-react";
import { PriceHistoryChart } from "@/components/charts";
import { ShareButton } from "@/components/ui/share-button";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://fiyattakip.com";

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      brand: true,
      category: true,
      priceHistory: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  return product;
}

async function getRelatedProducts(categoryId: string, productId: string) {
  return prisma.product.findMany({
    where: {
      categoryId,
      isActive: true,
      id: { not: productId },
    },
    include: { brand: true },
    take: 4,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Ürün Bulunamadı" };
  }

  return {
    title: `${product.name} - Fiyat Takip`,
    description:
      product.metaDescription ||
      product.shortDescription ||
      `${product.name} fiyat bilgisi ve karşılaştırması.`,
  };
}

export default async function UrunDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = product.categoryId
    ? await getRelatedProducts(product.categoryId, product.id)
    : [];

  const displayPrice = product.discountedPrice || product.currentPrice;
  const hasDiscount = !!product.discountedPrice;

  // Breadcrumb items for JSON-LD
  const breadcrumbItems = [
    { name: "Ana Sayfa", url: BASE_URL },
    { name: "Ürünler", url: `${BASE_URL}/urunler` },
    ...(product.category
      ? [{ name: product.category.name, url: `${BASE_URL}/kategoriler/${product.category.slug}` }]
      : []),
    { name: product.name, url: `${BASE_URL}/urunler/${product.slug}` },
  ];

  return (
    <>
      {/* Schema.org JSON-LD */}
      <ProductLd
        name={product.name}
        description={product.description || product.shortDescription || undefined}
        sku={product.sku || undefined}
        barcode={product.barcode || undefined}
        brand={product.brand?.name}
        category={product.category?.name}
        price={displayPrice}
        availability={product.stock > 0 ? "InStock" : "OutOfStock"}
        url={`${BASE_URL}/urunler/${product.slug}`}
        lowPrice={product.minPrice || undefined}
        highPrice={product.maxPrice || undefined}
      />
      <BreadcrumbLd items={breadcrumbItems} />

      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground whitespace-nowrap">
            Ana Sayfa
          </Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
          <Link href="/urunler" className="hover:text-foreground whitespace-nowrap">
            Ürünler
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <Link
                href={`/kategoriler/${product.category.slug}`}
                className="hover:text-foreground whitespace-nowrap"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
          <span className="text-foreground truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </nav>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Image */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
            <ProductImage
              productName={product.name}
              categorySlug={product.category?.slug}
              brandName={product.brand?.name}
              size="xl"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Brand */}
          {product.brand && (
            <Link
              href={`/markalar/${product.brand.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {product.brand.name}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold">{product.name}</h1>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.isNew && <Badge>Yeni</Badge>}
            {product.isFeatured && <Badge variant="secondary">Öne Çıkan</Badge>}
            {product.category && (
              <Badge variant="outline">{product.category.name}</Badge>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.currentPrice)}
                  </span>
                  <Badge variant="destructive">
                    %
                    {calculateDiscountPercentage(
                      product.currentPrice,
                      product.discountedPrice!
                    )}{" "}
                    İndirim
                  </Badge>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Son güncelleme: {formatDate(product.updatedAt)}
            </p>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product.stock > 0 ? (
              <span className="text-green-600">
                Stokta ({product.stock} adet)
              </span>
            ) : (
              <span className="text-red-600">Stokta Yok</span>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="flex-1">
              <Heart className="mr-2 h-5 w-5" />
              Favorilere Ekle
            </Button>
            <Button size="lg" variant="outline" className="flex-1">
              <Bell className="mr-2 h-5 w-5" />
              Fiyat Alarmı Kur
            </Button>
            <ShareButton
              title={product.name}
              description={`${product.name} - ${formatPrice(displayPrice)} | Fiyat Takip`}
              size="lg"
            />
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="font-semibold">Açıklama</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-2">
            <h3 className="font-semibold">Ürün Bilgileri</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {product.sku && (
                <>
                  <dt className="text-muted-foreground">SKU</dt>
                  <dd>{product.sku}</dd>
                </>
              )}
              {product.barcode && (
                <>
                  <dt className="text-muted-foreground">Barkod</dt>
                  <dd>{product.barcode}</dd>
                </>
              )}
              <dt className="text-muted-foreground">Eklenme Tarihi</dt>
              <dd>{formatDate(product.createdAt)}</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Price History */}
      {product.priceHistory.length > 0 && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Fiyat Geçmişi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chart */}
            {product.priceHistory.length >= 2 && (
              <PriceHistoryChart
                data={product.priceHistory.map((h) => ({
                  date: h.createdAt,
                  price: h.price,
                }))}
                height={200}
              />
            )}

            {/* History List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Detaylı Geçmiş
              </h4>
              {product.priceHistory.map((history) => (
                <div
                  key={history.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="text-muted-foreground">
                    {formatDate(history.createdAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {formatPrice(history.price)}
                    </span>
                    {history.oldPrice && history.oldPrice > history.price && (
                      <Badge variant="secondary" className="text-xs text-green-600">
                        -%
                        {calculateDiscountPercentage(
                          history.oldPrice,
                          history.price
                        )}
                      </Badge>
                    )}
                    {history.oldPrice && history.oldPrice < history.price && (
                      <Badge variant="secondary" className="text-xs text-red-600">
                        +%
                        {calculateDiscountPercentage(
                          history.price,
                          history.oldPrice
                        )}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Benzer Ürünler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/urunler/${relatedProduct.slug}`}
              >
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group overflow-hidden">
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-xl mb-4 overflow-hidden">
                      <ProductImage
                        productName={relatedProduct.name}
                        categorySlug={product.category?.slug}
                        brandName={relatedProduct.brand?.name}
                        size="xl"
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      {relatedProduct.brand && (
                        <span className="text-xs text-primary font-medium uppercase tracking-wide">
                          {relatedProduct.brand.name}
                        </span>
                      )}
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(relatedProduct.currentPrice)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Legal Notice */}
        <div className="mt-12 p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
          <p>
            Bu sayfa yalnızca fiyat bilgilendirme amaçlıdır. Satış
            yapılmamaktadır.
          </p>
        </div>
      </div>
    </>
  );
}
