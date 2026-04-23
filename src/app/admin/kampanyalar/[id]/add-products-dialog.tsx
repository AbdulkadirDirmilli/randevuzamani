"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Check, Loader2 } from "lucide-react";
import { addProductsToCampaign, getProductsForCampaign } from "@/actions/campaign.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/format";

interface Product {
  id: string;
  name: string;
  currentPrice: number;
  brand: { name: string } | null;
  category: { name: string } | null;
}

interface AddProductsDialogProps {
  campaignId: string;
}

export function AddProductsDialog({ campaignId }: AddProductsDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        loadProducts(search);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, open]);

  const loadProducts = async (query?: string) => {
    setIsSearching(true);
    try {
      const data = await getProductsForCampaign(query);
      setProducts(data);
    } catch {
      toast({
        title: "Hata",
        description: "Ürünler yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedIds(newSelected);
  };

  const handleAdd = async () => {
    if (selectedIds.size === 0) return;

    setIsLoading(true);
    try {
      const result = await addProductsToCampaign(campaignId, Array.from(selectedIds));

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
        description: `${result.added} ürün kampanyaya eklendi`,
      });

      setOpen(false);
      setSelectedIds(new Set());
      router.refresh();
    } catch {
      toast({
        title: "Hata",
        description: "Ürünler eklenemedi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ürün Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kampanyaya Ürün Ekle</DialogTitle>
          <DialogDescription>
            Kampanyaya eklemek istediğiniz ürünleri seçin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ürün adı, barkod veya SKU ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[400px] border rounded-lg">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : products.length > 0 ? (
              <div className="divide-y">
                {products.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedIds.has(product.id)}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {product.brand && <span>{product.brand.name}</span>}
                        {product.brand && product.category && <span>•</span>}
                        {product.category && <span>{product.category.name}</span>}
                      </div>
                    </div>
                    <div className="font-semibold">
                      {formatPrice(product.currentPrice)}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                {search ? "Ürün bulunamadı" : "Ürün yok"}
              </div>
            )}
          </ScrollArea>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>{selectedIds.size} ürün seçildi</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            İptal
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedIds.size === 0 || isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {selectedIds.size > 0 ? `${selectedIds.size} Ürün Ekle` : "Ürün Ekle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
