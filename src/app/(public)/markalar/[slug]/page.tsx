import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, calculateDiscountPercentage } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BreadcrumbLd } from "@/components/seo/json-ld";
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { SORT_OPTIONS, PAGINATION } from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

async function getBrand(slug: string) {
  const brand = await prisma.brand.findUnique({
    where: { slug, isActive: true },
  });

  return brand;
}

async function getBrandProducts(brandId: string, sort?: string, page = 1) {
  const limit = PAGINATION.defaultPageSize;
  const skip = (page - 1) * limit;

  let orderBy: Record<string, string> = { createdAt: "desc" };

  switch (sort) {
    case "price_asc":
      orderBy = { currentPrice: "asc" };
      break;
    case "price_desc":
      orderBy = { currentPrice: "desc" };
      break;
    case "name_asc":
      orderBy = { name: "asc" };
      break;
    case "name_desc":
      orderBy = { name: "desc" };
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        brandId,
        isActive: true,
      },
      include: {
        category: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({
      where: { brandId, isActive: true },
    }),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

async function getBrandStats(brandId: string) {
  const products = await prisma.product.findMany({
    where: { brandId, isActive: true },
    select: {
      currentPrice: true,
      discountedPrice: true,
      minPrice: true,
      maxPrice: true,
    },
  });

  if (products.length === 0) {
    return null;
  }

  const prices = products.map(p => p.discountedPrice || p.currentPrice);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const discountedCount = products.filter(p => p.discountedPrice).length;

  return {
    avgPrice,
    minPrice,
    maxPrice,
    totalProducts: products.length,
    discountedCount,
  };
}

export default async function MarkaDetayPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const brand = await getBrand(slug);

  if (!brand) {
    notFound();
  }

  const page = parseInt(search.page || "1");
  const [{ products, total, totalPages }, stats] = await Promise.all([
    getBrandProducts(brand.id, search.sort, page),
    getBrandStats(brand.id),
  ]);

  const breadcrumbs = [
    { name: "Ana Sayfa", url: "/" },
    { name: "Markalar", url: "/markalar" },
    { name: brand.name, url: `/markalar/${brand.slug}` },
  ];

  return (
    <>
      <BreadcrumbLd items={breadcrumbs} />

      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Ana Sayfa</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/markalar" className="hover:text-foreground">Markalar</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{brand.name}</span>
        </nav>

        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/markalar">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tüm Markalar
          </Link>
        </Button>

        {/* Brand Header */}
        <div className="bg-muted/30 rounded-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Logo */}
            <div className="w-24 h-24 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-20 h-20 object-contain"
                />
              ) : (
                <span className="text-4xl font-bold text-muted-foreground">
                  {brand.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
              {brand.description && (
                <p className="text-muted-foreground mb-4 max-w-2xl">
                  {brand.description}
                </p>
              )}
              {brand.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {brand.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Stats */}
            {stats && (
              <div className="flex flex-wrap gap-4 lg:gap-6">
                <div className="text-center px-4">
                  <div className="text-2xl font-bold text-primary">
                    {stats.totalProducts}
                  </div>
                  <div className="text-xs text-muted-foreground">Ürün</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(stats.minPrice)}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    En Düşük
                  </div>
                </div>
                <div className="text-center px-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatPrice(stats.maxPrice)}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    En Yüksek
                  </div>
                </div>
                {stats.discountedCount > 0 && (
                  <div className="text-center px-4">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.discountedCount}
                    </div>
                    <div className="text-xs text-muted-foreground">İndirimli</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Products Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-semibold">
              Ürünler
              <Badge variant="secondary" className="ml-2">{total}</Badge>
            </h2>

            <Select defaultValue={search.sort || "newest"}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/urunler/${product.slug}`}>
                  <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardContent className="p-4">
                      {product.discountedPrice && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-2 -right-2 z-10"
                        >
                          %{calculateDiscountPercentage(
                            product.currentPrice,
                            product.discountedPrice
                          )}
                        </Badge>
                      )}

                      {product.isNew && <Badge className="mb-2">Yeni</Badge>}

                      <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                        <span className="text-6xl">🍾</span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-medium line-clamp-2 min-h-[2.5rem]">
                          {product.name}
                        </h3>

                        {product.category && (
                          <Badge variant="secondary" className="text-xs">
                            {product.category.name}
                          </Badge>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">
                            {formatPrice(
                              product.discountedPrice || product.currentPrice
                            )}
                          </span>
                          {product.discountedPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.currentPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Ürün Bulunamadı</h3>
              <p className="text-muted-foreground">
                Bu markaya ait ürün bulunmuyor.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <Button variant="outline" asChild>
                  <Link
                    href={{
                      pathname: `/markalar/${brand.slug}`,
                      query: { ...search, page: page - 1 },
                    }}
                  >
                    Önceki
                  </Link>
                </Button>
              )}
              <span className="flex items-center px-4">
                Sayfa {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Button variant="outline" asChild>
                  <Link
                    href={{
                      pathname: `/markalar/${brand.slug}`,
                      query: { ...search, page: page + 1 },
                    }}
                  >
                    Sonraki
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getBrand(slug);

  if (!brand) {
    return {
      title: "Marka Bulunamadı | Fiyat Takip",
    };
  }

  return {
    title: `${brand.name} Ürünleri | Fiyat Takip`,
    description: brand.description || `${brand.name} marka ürünlerini inceleyin ve fiyatlarını takip edin.`,
  };
}
