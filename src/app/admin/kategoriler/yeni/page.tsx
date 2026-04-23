import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/forms/category-form";

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function YeniKategoriPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Yeni Kategori</h1>
        <p className="text-muted-foreground">Yeni bir kategori ekleyin</p>
      </div>

      <CategoryForm categories={categories} />
    </div>
  );
}
