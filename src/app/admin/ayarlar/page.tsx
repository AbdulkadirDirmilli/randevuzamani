"use client";

import { useState, useEffect } from "react";
import { Settings, Globe, Bell, Database, Shield, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

export default function AdminAyarlarPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Fiyat Takip",
    siteDescription: "Alkollü içecek fiyat takip ve bilgilendirme platformu",
    contactEmail: "info@fiyattakip.com",
    contactPhone: "",
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    priceAlertNotifications: true,
    campaignNotifications: true,
    weeklyDigest: false,
  });

  // SEO Settings
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: "Fiyat Takip - Alkollü İçecek Fiyat Bilgilendirme",
    metaDescription: "Alkollü içecek fiyatlarını takip edin, karşılaştırın.",
    googleAnalyticsId: "",
  });

  const handleSave = async () => {
    setIsLoading(true);

    // Simulate save - in production this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Başarılı",
      description: "Ayarlar kaydedildi",
    });

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Ayarlar</h1>
          <p className="text-muted-foreground">
            Site ayarlarını yönetin
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Kaydet
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4 hidden sm:inline" />
            Genel
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4 hidden sm:inline" />
            Bildirimler
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Database className="h-4 w-4 hidden sm:inline" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4 hidden sm:inline" />
            Güvenlik
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Genel Ayarlar</CardTitle>
              <CardDescription>
                Sitenin temel bilgilerini düzenleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Adı</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">İletişim E-postası</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Açıklaması</Label>
                <Textarea
                  id="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">İletişim Telefonu</Label>
                <Input
                  id="contactPhone"
                  value={generalSettings.contactPhone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Ayarları</CardTitle>
              <CardDescription>
                Bildirim tercihlerini yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>E-posta Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Kullanıcılara e-posta bildirimleri gönder
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Fiyat Alarm Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Fiyat hedefine ulaşıldığında bildir
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.priceAlertNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, priceAlertNotifications: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Kampanya Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Yeni kampanyalar başladığında bildir
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.campaignNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, campaignNotifications: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Haftalık Özet</Label>
                  <p className="text-sm text-muted-foreground">
                    Kullanıcılara haftalık fiyat özeti gönder
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.weeklyDigest}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, weeklyDigest: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Ayarları</CardTitle>
              <CardDescription>
                Arama motoru optimizasyonu ayarları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Başlık</Label>
                <Input
                  id="metaTitle"
                  value={seoSettings.metaTitle}
                  onChange={(e) => setSeoSettings({ ...seoSettings, metaTitle: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Maksimum 60 karakter önerilir
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Açıklama</Label>
                <Textarea
                  id="metaDescription"
                  value={seoSettings.metaDescription}
                  onChange={(e) => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Maksimum 160 karakter önerilir
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <Input
                  id="googleAnalyticsId"
                  value={seoSettings.googleAnalyticsId}
                  onChange={(e) => setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Güvenlik Ayarları</CardTitle>
              <CardDescription>
                Site güvenlik ayarlarını yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Güvenlik Durumu</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>HTTPS Aktif</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Şifreler Hashlenmiş (bcrypt)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>JWT Oturum Yönetimi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>CSRF Koruması</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Admin Erişim Logları</Label>
                <p className="text-sm text-muted-foreground">
                  Admin paneline son erişimler
                </p>
                <div className="p-4 bg-muted rounded-lg text-sm font-mono space-y-1">
                  <p className="text-muted-foreground">Log kaydı bulunmuyor</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
