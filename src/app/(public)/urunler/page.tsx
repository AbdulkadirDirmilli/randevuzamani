import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatPrice, calculateDiscountPercentage } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImage } from "@/components/ui/product-image";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { SORT_OPTIONS, PAGINATION } from "@/lib/constants";

interface SearchParams {
  q?: string;
  category?: string;
  brand?: string;
  sort?: string;
  page?: string;
}

async function getProducts(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1");
  const limit = PAGINATION.defaultPageSize;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    isActive: true,
  };

  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q } },
      { description: { contains: searchParams.q } },
    ];
  }

  if (searchParams.category) {
    where.category = { slug: searchParams.category };
  }

  if (searchParams.brand) {
    where.brand = { slug: searchParams.brand };
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };

  switch (searchParams.sort) {
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
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { brand: true, category: true },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

async function getFilters() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { categories, brands };
}

function ProductSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="aspect-square rounded-lg mb-4" />
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-6 w-1/2" />
      </CardContent>
    </Card>
  );
}

export default async function UrunlerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [{ products, total, page, totalPages }, { categories, brands }] =
    await Promise.all([getProducts(params), getFilters()]);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ürünler</h1>
        <p className="text-muted-foreground">
          Toplam {total} ürün bulundu
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <form className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Ürün ara..."
            defaultValue={params.q}
            className="pl-10"
          />
        </form>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Select defaultValue={params.category}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue={params.brand}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Marka" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Markalar</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.slug}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue={params.sort || "newest"}>
            <SelectTrigger className="w-full">
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
          <Button variant="outline" className="w-full">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Filtrele</span>
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        }
      >
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/urunler/${product.slug}`}>
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group overflow-hidden">
                  <CardContent className="p-4 relative">
                    {product.isNew && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-green-500 hover:bg-green-600 shadow-lg">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Yeni
                        </Badge>
                      </div>
                    )}
                    <div className="aspect-square rounded-xl mb-4 overflow-hidden">
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
                      {product.category && (
                        <Badge variant="secondary" className="text-xs">
                          {product.category.name}
                        </Badge>
                      )}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(
                            product.discountedPrice || product.currentPrice
                          )}
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
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Ürün bulunamadı.</p>
          </div>
        )}
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Button variant="outline" asChild>
              <Link
                href={{
                  pathname: "/urunler",
                  query: { ...params, page: page - 1 },
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
                  pathname: "/urunler",
                  query: { ...params, page: page + 1 },
                }}
              >
                Sonraki
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
