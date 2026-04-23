import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/forms/product-form";

async function getData() {
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

export default async function YeniUrunPage() {
  const { categories, brands } = await getData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Yeni Ürün</h1>
        <p className="text-muted-foreground">Yeni bir ürün ekleyin</p>
      </div>

      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
