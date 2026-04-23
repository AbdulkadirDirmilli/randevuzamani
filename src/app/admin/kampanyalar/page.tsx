import Link from "next/link";
import { Plus, Megaphone, Calendar, Percent, Tag, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { getCampaigns, deleteCampaign, toggleCampaignStatus } from "@/actions/campaign.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatPrice } from "@/lib/format";

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

export default async function KampanyalarPage() {
  const campaigns = await getCampaigns();

  const activeCampaigns = campaigns.filter((c) => {
    const now = new Date();
    return c.isActive && now >= c.startDate && now <= c.endDate;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Kampanyalar</h1>
          <p className="text-muted-foreground">
            {activeCampaigns} aktif kampanya
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/kampanyalar/yeni">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kampanya
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCampaigns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {campaigns.filter((c) => c.isActive && new Date() < c.startDate).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sona Eren</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {campaigns.filter((c) => new Date() > c.endDate).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      {campaigns.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const status = getCampaignStatus(campaign);
            return (
              <Card key={campaign.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <Badge variant="outline">{getCampaignTypeLabel(campaign.type)}</Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/kampanyalar/${campaign.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Görüntüle
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/kampanyalar/${campaign.id}/duzenle`}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Düzenle
                          </Link>
                        </DropdownMenuItem>
                        <form
                          action={async () => {
                            "use server";
                            await toggleCampaignStatus(campaign.id);
                          }}
                        >
                          <DropdownMenuItem asChild>
                            <button type="submit" className="w-full">
                              <Tag className="h-4 w-4 mr-2" />
                              {campaign.isActive ? "Pasif Yap" : "Aktif Yap"}
                            </button>
                          </DropdownMenuItem>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            await deleteCampaign(campaign.id);
                          }}
                        >
                          <DropdownMenuItem asChild>
                            <button
                              type="submit"
                              className="w-full text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Sil
                            </button>
                          </DropdownMenuItem>
                        </form>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {campaign.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {campaign.discountType === "PERCENTAGE"
                          ? `%${campaign.discountValue}`
                          : formatPrice(campaign.discountValue)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span>{campaign.products.length} ürün</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Başlangıç:</span>
                      <span>{formatDate(campaign.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bitiş:</span>
                      <span>{formatDate(campaign.endDate)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Henüz kampanya yok</h3>
            <p className="text-muted-foreground text-center mb-4">
              İlk kampanyanızı oluşturarak indirimli ürünleri tanıtın.
            </p>
            <Button asChild>
              <Link href="/admin/kampanyalar/yeni">
                <Plus className="h-4 w-4 mr-2" />
                İlk Kampanyayı Oluştur
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
