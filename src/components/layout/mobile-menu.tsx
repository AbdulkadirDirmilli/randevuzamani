"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Logo } from "./logo";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/80 md:hidden"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-background md:hidden">
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Logo />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Menüyü kapat</span>
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-4">
            {/* Navigation */}
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Separator className="my-4" />

            {/* User Section */}
            {user ? (
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Separator className="my-2" />
                <Link
                  href="/hesabim"
                  onClick={onClose}
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Hesabım
                </Link>
                <Link
                  href="/hesabim/favorilerim"
                  onClick={onClose}
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Favorilerim
                </Link>
                <Link
                  href="/hesabim/fiyat-alarmlarim"
                  onClick={onClose}
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Fiyat Alarmlarım
                </Link>
                <Link
                  href="/hesabim/bildirimlerim"
                  onClick={onClose}
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Bildirimlerim
                </Link>
                {user.role === "ADMIN" && (
                  <>
                    <Separator className="my-2" />
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Admin Panel
                    </Link>
                  </>
                )}
                <Separator className="my-2" />
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/giris" onClick={onClose}>
                    Giriş Yap
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/kayit" onClick={onClose}>
                    Kayıt Ol
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
