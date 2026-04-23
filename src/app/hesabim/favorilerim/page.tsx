import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

async function getFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    include: {
      product: {
        include: { brand: true, category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function FavorilerimPage() {
  const session = await auth();
  if (!session?.user) return null;

  const favorites = await getFavorites(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Favorilerim</h1>
          <p className="text-muted-foreground">
            {favorites.length} ürün favorilerinizde
          </p>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Link href={`/urunler/${favorite.product.slug}`}>
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-6xl">🍾</span>
                  </div>
                  <div className="space-y-2">
                    {favorite.product.brand && (
                      <span className="text-xs text-muted-foreground">
                        {favorite.product.brand.name}
                      </span>
                    )}
                    <h3 className="font-medium line-clamp-2">
                      {favorite.product.name}
                    </h3>
                    {favorite.product.category && (
                      <Badge variant="secondary" className="text-xs">
                        {favorite.product.category.name}
                      </Badge>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">
                        {formatPrice(
                          favorite.product.discountedPrice ||
                            favorite.product.currentPrice
                        )}
                      </span>
                      {favorite.product.discountedPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(favorite.product.currentPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Henüz favori ürününüz yok</h3>
            <p className="text-muted-foreground text-center mb-4">
              Beğendiğiniz ürünleri favorilere ekleyerek takip edebilirsiniz.
            </p>
            <Button asChild>
              <Link href="/urunler">Ürünleri İncele</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
