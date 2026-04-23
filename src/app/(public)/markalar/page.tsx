import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Building2, ArrowRight } from "lucide-react";

interface SearchParams {
  q?: string;
}

async function getBrands(search?: string) {
  const where: Record<string, unknown> = {
    isActive: true,
  };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const brands = await prisma.brand.findMany({
    where,
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return brands;
}

export default async function MarkalarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const brands = await getBrands(params.q);

  // Markaları ürün sayısına göre grupla
  const popularBrands = brands.filter(b => b._count.products >= 3);
  const otherBrands = brands.filter(b => b._count.products < 3);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Markalar</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Takip ettiğimiz tüm markaları keşfedin.
          Marka bazlı fiyat karşılaştırması yapın.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-12">
        <form className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Marka ara..."
            defaultValue={params.q}
            className="pl-10"
          />
        </form>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 mb-12">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{brands.length}</div>
          <div className="text-sm text-muted-foreground">Toplam Marka</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            {brands.reduce((sum, b) => sum + b._count.products, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Toplam Ürün</div>
        </div>
      </div>

      {brands.length > 0 ? (
        <div className="space-y-12">
          {/* Popular Brands */}
          {popularBrands.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Popüler Markalar
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {popularBrands.map((brand) => (
                  <Link key={brand.id} href={`/markalar/${brand.slug}`}>
                    <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                      <CardContent className="p-6 text-center">
                        <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="w-16 h-16 object-contain"
                            />
                          ) : (
                            <span className="text-3xl font-bold text-muted-foreground">
                              {brand.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold mb-1">{brand.name}</h3>
                        <Badge variant="secondary">
                          {brand._count.products} ürün
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All Brands */}
          {otherBrands.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Tüm Markalar</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {otherBrands.map((brand) => (
                  <Link key={brand.id} href={`/markalar/${brand.slug}`}>
                    <Card className="h-full transition-colors hover:bg-muted/50">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-muted-foreground">
                              {brand.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{brand.name}</h3>
                            <span className="text-xs text-muted-foreground">
                              {brand._count.products} ürün
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Marka Bulunamadı</h3>
          <p className="text-muted-foreground">
            {params.q
              ? `"${params.q}" aramasına uygun marka bulunamadı.`
              : "Henüz marka eklenmemiş."}
          </p>
        </div>
      )}

      {/* Alphabetical Index */}
      {brands.length > 10 && (
        <div className="mt-16 text-center">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Alfabetik İndeks
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from(new Set(brands.map(b => b.name.charAt(0).toUpperCase())))
              .sort()
              .map((letter) => (
                <a
                  key={letter}
                  href={`#${letter}`}
                  className="w-8 h-8 rounded bg-muted flex items-center justify-center text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {letter}
                </a>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: "Markalar | Fiyat Takip",
  description: "Takip ettiğimiz tüm markaları keşfedin. Marka bazlı fiyat karşılaştırması yapın.",
};
