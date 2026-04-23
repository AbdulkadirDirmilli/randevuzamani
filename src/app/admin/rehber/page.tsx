import {
  BookOpen,
  Package,
  FolderTree,
  Tag,
  Upload,
  Megaphone,
  Bell,
  Users,
  TrendingUp,
  Settings,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Info,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function RehberPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Yönetim Paneli Rehberi</h1>
        <p className="text-muted-foreground">
          Platformun nasıl çalıştığını ve özelliklerin nasıl kullanılacağını öğrenin
        </p>
      </div>

      {/* Quick Overview */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Platform Hakkında
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Bu platform bir <strong>fiyat takip ve bilgilendirme</strong> sistemidir.
            E-ticaret sitesi <strong>değildir</strong> - satın alma veya ödeme işlemi yapılmaz.
          </p>
          <p>
            Amaç: Müşterilerin ürün fiyatlarını takip etmesi, fiyat değişikliklerinden
            haberdar olması ve en uygun zamanı yakalamasıdır.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline">Fiyat Takibi</Badge>
            <Badge variant="outline">Fiyat Alarmları</Badge>
            <Badge variant="outline">Kampanya Duyuruları</Badge>
            <Badge variant="outline">Fiyat Geçmişi</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Feature Sections */}
      <div className="grid gap-6">
        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Ürün Yönetimi
            </CardTitle>
            <CardDescription>Ürün ekleme, düzenleme ve fiyat güncelleme</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="add-product">
                <AccordionTrigger>Yeni Ürün Nasıl Eklenir?</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Sol menüden <strong>Ürünler</strong> sayfasına gidin</li>
                    <li>Sağ üstteki <strong>Yeni Ürün</strong> butonuna tıklayın</li>
                    <li>Ürün bilgilerini doldurun:
                      <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                        <li>Ürün adı (zorunlu)</li>
                        <li>Güncel fiyat (zorunlu)</li>
                        <li>Kategori ve marka seçimi</li>
                        <li>Stok miktarı</li>
                        <li>Açıklama ve SEO bilgileri</li>
                      </ul>
                    </li>
                    <li><strong>Kaydet</strong> butonuna tıklayın</li>
                  </ol>
                  <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg">
                    <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                    <p className="text-sm">
                      <strong>İpucu:</strong> Toplu ürün eklemek için Import özelliğini kullanın.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="update-price">
                <AccordionTrigger>Fiyat Nasıl Güncellenir?</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p><strong>Tekil Güncelleme:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Ürünler listesinden ürünü bulun</li>
                    <li>Düzenle butonuna tıklayın</li>
                    <li>Yeni fiyatı girin ve kaydedin</li>
                  </ol>

                  <p className="mt-4"><strong>Toplu Güncelleme:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Ürünler sayfasında <strong>Toplu İşlem</strong> butonuna tıklayın</li>
                    <li>Güncelleme türünü seçin (Yüzde/Sabit)</li>
                    <li>Artış veya azalış yönünü belirleyin</li>
                    <li>Değeri girin ve uygulayın</li>
                  </ol>

                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <p className="text-sm">
                      <strong>Dikkat:</strong> Fiyat değişiklikleri otomatik olarak fiyat geçmişine kaydedilir.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price-history">
                <AccordionTrigger>Fiyat Geçmişi Nasıl Çalışır?</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>Her fiyat değişikliği otomatik olarak kaydedilir:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Manuel fiyat güncellemeleri</li>
                    <li>Toplu fiyat güncellemeleri</li>
                    <li>Import ile yapılan değişiklikler</li>
                    <li>Kampanya indirimleri</li>
                  </ul>
                  <p className="mt-3">
                    Kullanıcılar ürün sayfasında fiyat grafiğini görebilir ve
                    en düşük/en yüksek fiyatları takip edebilir.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Categories & Brands */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-green-500" />
              Kategori ve Marka Yönetimi
            </CardTitle>
            <CardDescription>Ürün organizasyonu ve filtreleme</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="categories">
                <AccordionTrigger>Kategoriler Nasıl Çalışır?</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>Kategoriler ürünleri gruplamak için kullanılır:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Hiyerarşik yapı:</strong> Alt kategoriler oluşturabilirsiniz</li>
                    <li><strong>Sıralama:</strong> Kategorilerin görünüm sırasını belirleyebilirsiniz</li>
                    <li><strong>Aktif/Pasif:</strong> Kategoriyi geçici olarak gizleyebilirsiniz</li>
                  </ul>
                  <p className="mt-3">
                    Örnek: Alkollü İçecekler → Şaraplar → Kırmızı Şaraplar
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="brands">
                <AccordionTrigger>Markalar Nasıl Yönetilir?</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>Markalar üreticileri/ithalatçıları temsil eder:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Marka adı ve açıklaması</li>
                    <li>Logo görseli (URL)</li>
                    <li>Web sitesi linki</li>
                  </ul>
                  <p className="mt-3 text-muted-foreground">
                    Kullanıcılar marka bazlı filtreleme yapabilir.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-500" />
              Toplu İçe Aktarma (Import)
            </CardTitle>
            <CardDescription>Excel veya CSV ile toplu veri yükleme</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="import-how">
                <AccordionTrigger>Import Nasıl Yapılır?</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Sol menüden <strong>Import</strong> sayfasına gidin</li>
                    <li>Veri türünü seçin (Ürün/Kategori/Marka)</li>
                    <li>Excel veya CSV dosyasını sürükleyip bırakın</li>
                    <li><strong>İçe Aktar</strong> butonuna tıklayın</li>
                  </ol>

                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="font-medium mb-2">Desteklenen Sütun İsimleri (Ürün):</p>
                    <div className="flex flex-wrap gap-1">
                      {["Ürün Adı", "Barkod", "Fiyat", "Stok", "Kategori", "Marka", "Açıklama"].map((col) => (
                        <Badge key={col} variant="secondary" className="text-xs">
                          {col}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <p className="text-sm">
                      <strong>Otomatik:</strong> Mevcut ürünler güncellenir, yeni ürünler eklenir.
                      Kategoriler ve markalar otomatik oluşturulur.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="import-template">
                <AccordionTrigger>Şablon Dosyası Nasıl Kullanılır?</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>Import sayfasında hazır şablonları indirebilirsiniz:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Ürün Şablonu:</strong> Tüm ürün alanları</li>
                    <li><strong>Kategori Şablonu:</strong> Ad, açıklama, sıra</li>
                    <li><strong>Marka Şablonu:</strong> Ad, açıklama</li>
                  </ul>
                  <p className="mt-3 text-muted-foreground">
                    Şablonu indirin, verilerinizi girin ve yükleyin.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-orange-500" />
              Kampanya Yönetimi
            </CardTitle>
            <CardDescription>İndirim kampanyaları ve promosyonlar</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="campaign-types">
                <AccordionTrigger>Kampanya Türleri Nelerdir?</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">Sezonluk Kampanya</p>
                      <p className="text-sm text-muted-foreground">
                        Yılbaşı, yaz sezonu gibi dönemsel indirimler
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">Flaş Satış</p>
                      <p className="text-sm text-muted-foreground">
                        Kısa süreli, yüksek indirimli kampanyalar
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">Stok Eritme</p>
                      <p className="text-sm text-muted-foreground">
                        Stok fazlası ürünler için indirim
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">Özel Kampanya</p>
                      <p className="text-sm text-muted-foreground">
                        Diğer tüm kampanya türleri
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="campaign-create">
                <AccordionTrigger>Kampanya Nasıl Oluşturulur?</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2">
                    <li><strong>Kampanyalar</strong> sayfasına gidin</li>
                    <li><strong>Yeni Kampanya</strong> butonuna tıklayın</li>
                    <li>Kampanya bilgilerini doldurun:
                      <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                        <li>Ad ve açıklama</li>
                        <li>Kampanya türü</li>
                        <li>İndirim türü (% veya TL)</li>
                        <li>İndirim miktarı</li>
                        <li>Başlangıç ve bitiş tarihi</li>
                      </ul>
                    </li>
                    <li>Kampanyayı oluşturun</li>
                    <li>Kampanya detay sayfasından <strong>ürün ekleyin</strong></li>
                  </ol>

                  <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg">
                    <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                    <p className="text-sm">
                      <strong>İpucu:</strong> Ürün bazında özel indirim oranı belirleyebilirsiniz.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="campaign-status">
                <AccordionTrigger>Kampanya Durumları Ne Anlama Gelir?</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Aktif</Badge>
                      <span className="text-sm">Kampanya şu anda geçerli</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Bekliyor</Badge>
                      <span className="text-sm">Başlangıç tarihi gelmedi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Sona Erdi</Badge>
                      <span className="text-sm">Bitiş tarihi geçti</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Pasif</Badge>
                      <span className="text-sm">Manuel olarak durduruldu</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* User Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-500" />
              Kullanıcı Özellikleri
            </CardTitle>
            <CardDescription>Favoriler ve fiyat alarmları</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="favorites">
                <AccordionTrigger>Favoriler Nasıl Çalışır?</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>Kullanıcılar beğendikleri ürünleri favorilere ekleyebilir:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Ürün sayfasında kalp ikonuna tıklama</li>
                    <li>Hesabım → Favorilerim sayfasından görüntüleme</li>
                    <li>Favori ürünlerdeki fiyat değişikliklerini takip etme</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price-alerts">
                <AccordionTrigger>Fiyat Alarmı Nasıl Çalışır?</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>Kullanıcılar hedef fiyat belirleyebilir:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Ürün sayfasında "Fiyat Alarmı Kur" butonuna tıklar</li>
                    <li>Hedef fiyatı girer (örn: "500 TL'nin altına düşerse")</li>
                    <li>Fiyat düştüğünde bildirim alır</li>
                  </ol>

                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg mt-3">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <p className="text-sm">
                      <strong>Not:</strong> Bildirim sistemi aktif edildiğinde kullanıcılara
                      email gönderilecektir.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Tips & Best Practices */}
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-green-500" />
              İpuçları ve En İyi Uygulamalar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Fiyat Güncellemeleri
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>Fiyatları düzenli olarak güncelleyin</li>
                  <li>Toplu güncelleme için Import kullanın</li>
                  <li>Büyük değişiklikler öncesi yedek alın</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Kampanyalar
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>Kampanyaları önceden planlayın</li>
                  <li>Öne çıkan kampanyalar ana sayfada görünür</li>
                  <li>Flaş satışları kısa tutun (1-3 gün)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Ürün Bilgileri
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>Açıklamaları detaylı yazın</li>
                  <li>SEO alanlarını doldurun</li>
                  <li>Görselleri optimize edin</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Stok Takibi
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>Düşük stok uyarılarını kontrol edin</li>
                  <li>Stoksuz ürünleri pasife alın</li>
                  <li>Stok miktarını güncel tutun</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500" />
              Hızlı Erişim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { key: "/admin", desc: "Dashboard" },
                { key: "/admin/urunler", desc: "Ürün Listesi" },
                { key: "/admin/urunler/yeni", desc: "Yeni Ürün" },
                { key: "/admin/kategoriler", desc: "Kategoriler" },
                { key: "/admin/markalar", desc: "Markalar" },
                { key: "/admin/kampanyalar", desc: "Kampanyalar" },
                { key: "/admin/import", desc: "İçe Aktarma" },
                { key: "/admin/ayarlar", desc: "Ayarlar" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <span className="text-sm">{item.desc}</span>
                  <code className="text-xs bg-background px-2 py-1 rounded">
                    {item.key}
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
