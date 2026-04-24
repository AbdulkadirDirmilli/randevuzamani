"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createProduct, updateProduct } from "@/actions/product.actions";
import { slugify } from "@/lib/utils";

function parseFirstImageUrl(images?: string | null): string {
  if (!images) return "";
  const trimmed = images.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("[")) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr) && typeof arr[0] === "string") return arr[0];
    } catch {
      return "";
    }
    return "";
  }
  return trimmed;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  sku: string | null;
  barcode: string | null;
  basePrice: number;
  currentPrice: number;
  discountedPrice: number | null;
  stock: number;
  lowStockAlert: number;
  brandId: string | null;
  categoryId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  images: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  brands: Brand[];
}

export function ProductForm({ product, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    shortDescription: product?.shortDescription || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    basePrice: product?.basePrice || 0,
    currentPrice: product?.currentPrice || 0,
    discountedPrice: product?.discountedPrice || null,
    stock: product?.stock || 0,
    lowStockAlert: product?.lowStockAlert || 10,
    brandId: product?.brandId || "",
    categoryId: product?.categoryId || "",
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    isNew: product?.isNew ?? false,
    imageUrl: parseFirstImageUrl(product?.images),
    metaTitle: product?.metaTitle || "",
    metaDescription: product?.metaDescription || "",
  });

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || slugify(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { imageUrl, ...rest } = formData;
      const trimmedUrl = imageUrl.trim();
      const data = {
        ...rest,
        basePrice: Number(rest.basePrice),
        currentPrice: Number(rest.currentPrice),
        discountedPrice: rest.discountedPrice
          ? Number(rest.discountedPrice)
          : null,
        stock: Number(rest.stock),
        lowStockAlert: Number(rest.lowStockAlert),
        brandId: rest.brandId || null,
        categoryId: rest.categoryId || null,
        images: trimmedUrl ? JSON.stringify([trimmedUrl]) : null,
      };

      const result = product
        ? await updateProduct(product.id, data)
        : await createProduct(data);

      if (result.error) {
        toast({
          title: "Hata",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Başarılı",
          description: product ? "Ürün güncellendi" : "Ürün oluşturuldu",
        });
        router.push("/admin/urunler");
        router.refresh();
      }
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
              <CardDescription>Ürünün temel bilgilerini girin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Ürün Adı *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="otomatik-olusturulur"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Kısa Açıklama</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, shortDescription: e.target.value })
                  }
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Ürün Fotoğrafı URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Boş bırakılırsa kategori bazlı varsayılan görsel kullanılır.
                </p>
                {formData.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.imageUrl}
                    alt="Önizleme"
                    className="h-32 w-32 rounded-lg object-cover border"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barkod</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fiyatlandırma</CardTitle>
              <CardDescription>Ürün fiyat bilgilerini girin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Maliyet Fiyatı *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, basePrice: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentPrice">Satış Fiyatı *</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.currentPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPrice: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountedPrice">İndirimli Fiyat</Label>
                  <Input
                    id="discountedPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discountedPrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountedPrice: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stok</CardTitle>
              <CardDescription>Stok bilgilerini girin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stok Miktarı</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockAlert">Düşük Stok Uyarısı</Label>
                  <Input
                    id="lowStockAlert"
                    type="number"
                    min="0"
                    value={formData.lowStockAlert}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lowStockAlert: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>Arama motoru optimizasyonu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Başlık</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.metaTitle.length}/60 karakter
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Açıklama</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, metaDescription: e.target.value })
                  }
                  maxLength={160}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.metaDescription.length}/160 karakter
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kategori & Marka</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Marka</Label>
                <Select
                  value={formData.brandId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, brandId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Marka seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Durum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Aktif</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Öne Çıkan</Label>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFeatured: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isNew">Yeni Ürün</Label>
                <Switch
                  id="isNew"
                  checked={formData.isNew}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isNew: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              İptal
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
