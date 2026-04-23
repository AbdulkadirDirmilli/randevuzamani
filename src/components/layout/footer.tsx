import Link from "next/link";
import { Wine, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";

const footerLinks = {
  kesfet: [
    { href: "/urunler", label: "Tüm Ürünler" },
    { href: "/kategoriler", label: "Kategoriler" },
    { href: "/markalar", label: "Markalar" },
    { href: "/kampanyalar", label: "Kampanyalar" },
  ],
  hesap: [
    { href: "/giris", label: "Giriş Yap" },
    { href: "/kayit", label: "Kayıt Ol" },
    { href: "/hesabim", label: "Hesabım" },
    { href: "/hesabim/favorilerim", label: "Favorilerim" },
    { href: "/hesabim/fiyat-alarmlarim", label: "Fiyat Alarmlarım" },
    { href: "/hesabim/bildirimler", label: "Bildirimler" },
  ],
};

async function getFooterCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { order: "asc" },
    take: 5,
    select: { name: true, slug: true },
  });
  return categories;
}

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const categories = await getFooterCategories();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Wine className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Fiyat Takip</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Alkollü içecek fiyat takip ve bilgilendirme platformu. Fiyatları
              karşılaştırın, indirimleri takip edin.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>İstanbul, Türkiye</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+90 (212) 123 45 67</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@fiyattakip.com</span>
              </div>
            </div>
          </div>

          {/* Keşfet */}
          <div>
            <h3 className="font-semibold mb-4">Keşfet</h3>
            <ul className="space-y-2">
              {footerLinks.kesfet.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kategoriler */}
          <div>
            <h3 className="font-semibold mb-4">Kategoriler</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/urunler?category=${category.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hesap */}
          <div>
            <h3 className="font-semibold mb-4">Hesabım</h3>
            <ul className="space-y-2">
              {footerLinks.hesap.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            &copy; {currentYear} Fiyat Takip. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            Bu site yalnızca fiyat bilgilendirme amaçlıdır. Satış yapılmamaktadır.
          </p>
        </div>
      </div>
    </footer>
  );
}
