import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/forms/category-form";

async function getData(id: string) {
  const [category, categories] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { category, categories };
}

export default async function EditKategoriPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { category, categories } = await getData(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kategori Düzenle</h1>
        <p className="text-muted-foreground">{category.name}</p>
      </div>

      <CategoryForm category={category} categories={categories} />
    </div>
  );
}
