import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { CategoryTable } from "./category-table";

async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      parent: true,
    },
    orderBy: { order: "asc" },
  });
}

export default async function AdminKategorilerPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Kategoriler</h1>
          <p className="text-muted-foreground">
            Toplam {categories.length} kategori
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/kategoriler/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kategori
          </Link>
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Listesi</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <CategoryTable categories={categories} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
