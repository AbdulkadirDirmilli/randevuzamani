"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { User, Heart, Bell, Settings } from "lucide-react";
import { Header, MobileMenu } from "@/components/layout";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/hesabim", label: "Hesabım", icon: User },
  { href: "/hesabim/favorilerim", label: "Favorilerim", icon: Heart },
  { href: "/hesabim/fiyat-alarmlarim", label: "Fiyat Alarmlarım", icon: Bell },
  { href: "/hesabim/bildirimler", label: "Bildirimler", icon: Bell },
  { href: "/hesabim/ayarlar", label: "Ayarlar", icon: Settings },
];

export function HesabimContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    redirect("/giris");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <main className="flex-1 container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </main>
    </div>
  );
}
