"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Megaphone,
  Percent,
  Users,
  Upload,
  Settings,
  ChevronLeft,
  LogOut,
  BookOpen,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/urunler", label: "Ürünler", icon: Package },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: FolderTree },
  { href: "/admin/markalar", label: "Markalar", icon: Tag },
  { href: "/admin/kampanyalar", label: "Kampanyalar", icon: Megaphone },
  { href: "/admin/indirimler", label: "İndirimler", icon: Percent },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/admin/import", label: "Import", icon: Upload },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
  { href: "/admin/rehber", label: "Rehber", icon: BookOpen },
];

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onCollapse?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({
  isCollapsed,
  onCollapse,
  isMobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r bg-background transition-all duration-300",
          // Desktop: show based on isCollapsed
          "hidden lg:block",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          // Mobile: show/hide based on isMobileOpen
          isMobileOpen && "block w-64"
        )}
      >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {(!isCollapsed || isMobileOpen) && <Logo />}
        {/* Mobile Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileClose}
          className="lg:hidden"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Menüyü kapat</span>
        </Button>
        {/* Desktop Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCollapse}
          className={cn("hidden lg:flex", isCollapsed && "mx-auto")}
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 transition-transform",
              isCollapsed && "rotate-180"
            )}
          />
          <span className="sr-only">
            {isCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
          </span>
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                  isCollapsed && !isMobileOpen && "justify-center px-2"
                )}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t p-2">
        <Separator className="mb-2" />
        <Link
          href="/"
          onClick={onMobileClose}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
            isCollapsed && !isMobileOpen && "justify-center px-2"
          )}
          title={isCollapsed && !isMobileOpen ? "Siteye Dön" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span>Siteye Dön</span>}
        </Link>
      </div>
    </aside>
    </>
  );
}
