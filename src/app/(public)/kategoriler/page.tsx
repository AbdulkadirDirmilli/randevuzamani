import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderTree, ArrowRight } from "lucide-react";

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      parentId: null, // Sadece ana kategoriler
    },
    include: {
      children: {
        where: { isActive: true },
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { order: "asc" },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { order: "asc" },
  });

  return categories;
}

export default async function KategorilerPage() {
  const categories = await getCategories();

  // Toplam ürün sayısını hesapla
  const totalProducts = categories.reduce((sum, cat) => {
    const childProducts = cat.children.reduce((s, c) => s + c._count.products, 0);
    return sum + cat._count.products + childProducts;
  }, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Kategoriler</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ürünleri kategorilere göre keşfedin.
          {totalProducts > 0 && ` Toplam ${totalProducts} ürün.`}
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const totalCategoryProducts = category._count.products +
              category.children.reduce((s, c) => s + c._count.products, 0);

            return (
              <Card key={category.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Category Header */}
                  <Link
                    href={`/urunler?category=${category.slug}`}
                    className="block p-6 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <span className="text-3xl">
                            {getCategoryEmoji(category.slug)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold">{category.name}</h2>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                        {category.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {category.description}
                          </p>
                        )}
                        <Badge variant="secondary" className="mt-2">
                          {totalCategoryProducts} ürün
                        </Badge>
                      </div>
                    </div>
                  </Link>

                  {/* Subcategories */}
                  {category.children.length > 0 && (
                    <div className="border-t px-6 py-4 bg-muted/30">
                      <p className="text-xs font-medium text-muted-foreground mb-3">
                        Alt Kategoriler
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {category.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/urunler?category=${child.slug}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-background rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            {child.name}
                            <span className="text-xs text-muted-foreground">
                              ({child._count.products})
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <FolderTree className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Kategori Bulunamadı</h3>
          <p className="text-muted-foreground">
            Henüz kategori eklenmemiş.
          </p>
        </div>
      )}

      {/* All Products Link */}
      <div className="text-center mt-12">
        <Link
          href="/urunler"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          Tüm ürünleri görüntüle
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// Kategori slug'ına göre emoji döndür
function getCategoryEmoji(slug: string): string {
  const emojiMap: Record<string, string> = {
    viski: "🥃",
    whisky: "🥃",
    vodka: "🍸",
    cin: "🍸",
    gin: "🍸",
    rom: "🍹",
    rum: "🍹",
    tekila: "🌵",
    tequila: "🌵",
    likör: "🍾",
    likor: "🍾",
    sarap: "🍷",
    "şarap": "🍷",
    wine: "🍷",
    bira: "🍺",
    beer: "🍺",
    sampanya: "🥂",
    "şampanya": "🥂",
    champagne: "🥂",
    raki: "🥛",
    "rakı": "🥛",
    konyak: "🥃",
    cognac: "🥃",
    brandy: "🥃",
    aperatif: "🍸",
    kokteyl: "🍹",
    cocktail: "🍹",
  };

  return emojiMap[slug.toLowerCase()] || "🍾";
}

export const metadata = {
  title: "Kategoriler | Fiyat Takip",
  description: "Alkollü içecek kategorilerini keşfedin. Viski, vodka, şarap, bira ve daha fazlası.",
};
