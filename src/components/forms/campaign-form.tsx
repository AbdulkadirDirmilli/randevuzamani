"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createCampaign, updateCampaign } from "@/actions/campaign.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: string;
  discountType: string;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isFeatured: boolean;
  image: string | null;
  bannerImage: string | null;
}

interface CampaignFormProps {
  campaign?: Campaign;
}

const campaignTypes = [
  { value: "SEASONAL", label: "Sezonluk Kampanya" },
  { value: "FLASH_SALE", label: "Flaş Satış" },
  { value: "CLEARANCE", label: "Stok Eritme" },
  { value: "SPECIAL", label: "Özel Kampanya" },
];

const discountTypes = [
  { value: "PERCENTAGE", label: "Yüzde (%)" },
  { value: "FIXED", label: "Sabit Tutar (TL)" },
];

function formatDateForInput(date: Date) {
  return new Date(date).toISOString().slice(0, 16);
}

export function CampaignForm({ campaign }: CampaignFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [discountType, setDiscountType] = useState(campaign?.discountType || "PERCENTAGE");

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);

    try {
      const result = campaign
        ? await updateCampaign(campaign.id, formData)
        : await createCampaign(formData);

      if (result.error) {
        toast({
          title: "Hata",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Başarılı",
        description: campaign
          ? "Kampanya güncellendi"
          : "Kampanya oluşturuldu",
      });

      router.push("/admin/kampanyalar");
      router.refresh();
    } catch {
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kampanya Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Kampanya Adı *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Örn: Yılbaşı İndirimi"
                  defaultValue={campaign?.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Kampanya açıklaması..."
                  rows={3}
                  defaultValue={campaign?.description || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Kampanya Türü *</Label>
                <Select name="type" defaultValue={campaign?.type || "SPECIAL"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaignTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>İndirim Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="discountType">İndirim Türü *</Label>
                  <Select
                    name="discountType"
                    defaultValue={campaign?.discountType || "PERCENTAGE"}
                    onValueChange={setDiscountType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tür seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {discountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    İndirim Değeri * {discountType === "PERCENTAGE" ? "(%)" : "(TL)"}
                  </Label>
                  <Input
                    id="discountValue"
                    name="discountValue"
                    type="number"
                    min="0"
                    max={discountType === "PERCENTAGE" ? "100" : undefined}
                    step={discountType === "PERCENTAGE" ? "1" : "0.01"}
                    placeholder={discountType === "PERCENTAGE" ? "10" : "50.00"}
                    defaultValue={campaign?.discountValue}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tarih Aralığı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Başlangıç Tarihi *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    defaultValue={
                      campaign?.startDate
                        ? formatDateForInput(campaign.startDate)
                        : ""
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Bitiş Tarihi *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    defaultValue={
                      campaign?.endDate
                        ? formatDateForInput(campaign.endDate)
                        : ""
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Durum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Aktif</Label>
                  <p className="text-sm text-muted-foreground">
                    Kampanya yayında mı?
                  </p>
                </div>
                <Switch
                  id="isActive"
                  name="isActive"
                  defaultChecked={campaign?.isActive ?? true}
                  value="true"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isFeatured">Öne Çıkan</Label>
                  <p className="text-sm text-muted-foreground">
                    Ana sayfada göster
                  </p>
                </div>
                <Switch
                  id="isFeatured"
                  name="isFeatured"
                  defaultChecked={campaign?.isFeatured ?? false}
                  value="true"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Görseller</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Kampanya Görseli</Label>
                <Input
                  id="image"
                  name="image"
                  type="url"
                  placeholder="https://..."
                  defaultValue={campaign?.image || ""}
                />
                <p className="text-xs text-muted-foreground">
                  Kare görsel önerilir (400x400)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bannerImage">Banner Görseli</Label>
                <Input
                  id="bannerImage"
                  name="bannerImage"
                  type="url"
                  placeholder="https://..."
                  defaultValue={campaign?.bannerImage || ""}
                />
                <p className="text-xs text-muted-foreground">
                  Geniş görsel önerilir (1200x400)
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              İptal
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {campaign ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
