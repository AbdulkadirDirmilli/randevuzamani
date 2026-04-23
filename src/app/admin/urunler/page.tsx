import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ProductTable } from "./product-table";
import { ProductFilters } from "./product-filters";

interface SearchParams {
  q?: string;
  category?: string;
  brand?: string;
  status?: string;
}

async function getProducts(searchParams: SearchParams) {
  const where: Record<string, unknown> = {};

  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q } },
      { sku: { contains: searchParams.q } },
      { barcode: { contains: searchParams.q } },
    ];
  }

  if (searchParams.category && searchParams.category !== "all") {
    where.categoryId = searchParams.category;
  }

  if (searchParams.brand && searchParams.brand !== "all") {
    where.brandId = searchParams.brand;
  }

  if (searchParams.status === "active") {
    where.isActive = true;
  } else if (searchParams.status === "inactive") {
    where.isActive = false;
  }

  return prisma.product.findMany({
    where,
    include: { brand: true, category: true },
    orderBy: { createdAt: "desc" },
  });
}

async function getFilters() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return { categories, brands };
}

export default async function AdminUrunlerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [products, filters] = await Promise.all([
    getProducts(params),
    getFilters(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Ürünler</h1>
          <p className="text-muted-foreground">
            Toplam {products.length} ürün
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/urunler/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ürün
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <ProductFilters
        categories={filters.categories}
        brands={filters.brands}
        currentFilters={params}
      />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ürün Listesi</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            {products.length > 0 ? (
              <ProductTable products={products} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {params.q || params.category || params.brand || params.status
                    ? "Filtrelere uygun ürün bulunamadı."
                    : "Henüz ürün eklenmemiş."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
