import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { BrandTable } from "./brand-table";

async function getBrands() {
  return prisma.brand.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
}

export default async function AdminMarkalarPage() {
  const brands = await getBrands();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Markalar</h1>
          <p className="text-muted-foreground">
            Toplam {brands.length} marka
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/markalar/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Marka
          </Link>
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Marka Listesi</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <BrandTable brands={brands} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
