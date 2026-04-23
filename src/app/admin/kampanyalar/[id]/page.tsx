import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil, Percent, Calendar, Tag, Package, Trash2 } from "lucide-react";
import { getCampaign, removeProductFromCampaign } from "@/actions/campaign.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/format";
import { AddProductsDialog } from "./add-products-dialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

function getCampaignStatus(campaign: { startDate: Date; endDate: Date; isActive: boolean }) {
  const now = new Date();
  if (!campaign.isActive) return { label: "Pasif", variant: "secondary" as const };
  if (now < campaign.startDate) return { label: "Bekliyor", variant: "outline" as const };
  if (now > campaign.endDate) return { label: "Sona Erdi", variant: "destructive" as const };
  return { label: "Aktif", variant: "success" as const };
}

function getCampaignTypeLabel(type: string) {
  const labels: Record<string, string> = {
    SEASONAL: "Sezonluk",
    FLASH_SALE: "Flaş Satış",
    CLEARANCE: "Stok Eritme",
    SPECIAL: "Özel Kampanya",
  };
  return labels[type] || type;
}

export default async function KampanyaDetayPage({ params }: PageProps) {
  const { id } = await params;
  const campaign = await getCampaign(id);

  if (!campaign) {
    notFound();
  }

  const status = getCampaignStatus(campaign);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/kampanyalar">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="text-muted-foreground">{campaign.description}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/kampanyalar/${id}/duzenle`}>
            <Pencil className="h-4 w-4 mr-2" />
            Düzenle
          </Link>
        </Button>
      </div>

      {/* Campaign Info */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İndirim</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign.discountType === "PERCENTAGE"
                ? `%${campaign.discountValue}`
                : formatPrice(campaign.discountValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {campaign.discountType === "PERCENTAGE" ? "Yüzde indirim" : "Sabit indirim"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tür</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCampaignTypeLabel(campaign.type)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başlangıç</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatDate(campaign.startDate)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bitiş</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatDate(campaign.endDate)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Products in Campaign */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kampanya Ürünleri</CardTitle>
              <CardDescription>
                Bu kampanyaya dahil olan ürünler ({campaign.products.length} ürün)
              </CardDescription>
            </div>
            <AddProductsDialog campaignId={id} />
          </div>
        </CardHeader>
        <CardContent>
          {campaign.products.length > 0 ? (
            <div className="space-y-3">
              {campaign.products.map((cp) => {
                const product = cp.product;
                const discountValue = cp.customDiscount ?? campaign.discountValue;
                const discountedPrice =
                  campaign.discountType === "PERCENTAGE"
                    ? product.currentPrice * (1 - discountValue / 100)
                    : product.currentPrice - discountValue;

                return (
                  <div
                    key={cp.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <Link
                          href={`/admin/urunler/${product.id}`}
                          className="font-medium hover:underline"
                        >
                          {product.name}
                        </Link>
                        <div className="flex items-center gap-2 text-sm">
                          {product.brand && (
                            <span className="text-muted-foreground">
                              {product.brand.name}
                            </span>
                          )}
                          {product.category && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                {product.category.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.currentPrice)}
                          </span>
                          <span className="font-bold text-green-600">
                            {formatPrice(Math.max(0, discountedPrice))}
                          </span>
                        </div>
                        {cp.customDiscount && (
                          <Badge variant="secondary" className="text-xs">
                            Özel: {campaign.discountType === "PERCENTAGE" ? `%${cp.customDiscount}` : formatPrice(cp.customDiscount)}
                          </Badge>
                        )}
                      </div>
                      <form
                        action={async () => {
                          "use server";
                          await removeProductFromCampaign(id, product.id);
                        }}
                      >
                        <Button variant="ghost" size="icon" type="submit">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Bu kampanyaya henüz ürün eklenmemiş.</p>
              <p className="text-sm">Ürün eklemek için yukarıdaki butonu kullanın.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
