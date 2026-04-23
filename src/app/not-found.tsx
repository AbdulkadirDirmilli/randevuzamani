import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <span className="text-9xl font-bold text-primary/20">404</span>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold mb-4">Sayfa Bulunamadı</h1>
        <p className="text-muted-foreground mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          Ana sayfaya dönebilir veya ürünlerde arama yapabilirsiniz.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Ana Sayfa
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/urunler">
              <Search className="h-4 w-4 mr-2" />
              Ürünleri İncele
            </Link>
          </Button>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href="javascript:history.back()"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Önceki sayfaya dön
          </Link>
        </div>
      </div>
    </div>
  );
}
