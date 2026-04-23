import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BrandForm } from "@/components/forms/brand-form";

async function getBrand(id: string) {
  return prisma.brand.findUnique({ where: { id } });
}

export default async function EditMarkaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await getBrand(id);

  if (!brand) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marka Düzenle</h1>
        <p className="text-muted-foreground">{brand.name}</p>
      </div>

      <BrandForm brand={brand} />
    </div>
  );
}
