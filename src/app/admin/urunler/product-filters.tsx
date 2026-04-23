"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFiltersProps {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  currentFilters: {
    q?: string;
    category?: string;
    brand?: string;
    status?: string;
  };
}

export function ProductFilters({
  categories,
  brands,
  currentFilters,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentFilters.q || "");

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`/admin/urunler?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("q", search);
  };

  const clearFilters = () => {
    setSearch("");
    startTransition(() => {
      router.push("/admin/urunler");
    });
  };

  const hasFilters =
    currentFilters.q ||
    (currentFilters.category && currentFilters.category !== "all") ||
    (currentFilters.brand && currentFilters.brand !== "all") ||
    (currentFilters.status && currentFilters.status !== "all");

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ürün adı, SKU veya barkod ile ara..."
              className="pl-10 pr-20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Ara"
              )}
            </Button>
          </form>

          {/* Filter Selects */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Select
              value={currentFilters.category || "all"}
              onValueChange={(value) => updateFilters("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentFilters.brand || "all"}
              onValueChange={(value) => updateFilters("brand", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Marka" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Markalar</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentFilters.status || "all"}
              onValueChange={(value) => updateFilters("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={isPending}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Temizle
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
