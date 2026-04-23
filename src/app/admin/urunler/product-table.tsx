"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { formatPrice, formatDateShort } from "@/lib/format";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  currentPrice: number;
  discountedPrice: number | null;
  stock: number;
  lowStockAlert: number;
  isActive: boolean;
  createdAt: Date;
  brand: { name: string } | null;
  category: { name: string } | null;
}

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ürün</TableHead>
          <TableHead className="hidden md:table-cell">Kategori</TableHead>
          <TableHead className="hidden md:table-cell">Marka</TableHead>
          <TableHead>Fiyat</TableHead>
          <TableHead className="hidden sm:table-cell">Stok</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead className="hidden lg:table-cell">Tarih</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <span className="text-lg">🍾</span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate max-w-[120px] sm:max-w-[200px]">
                    {product.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.sku || "-"}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {product.category?.name || "-"}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {product.brand?.name || "-"}
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{formatPrice(product.currentPrice)}</p>
                {product.discountedPrice && (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.discountedPrice)}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Badge
                variant={
                  product.stock > product.lowStockAlert
                    ? "success"
                    : product.stock > 0
                    ? "warning"
                    : "destructive"
                }
              >
                {product.stock}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? "Aktif" : "Pasif"}
              </Badge>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {formatDateShort(product.createdAt)}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/urunler/${product.slug}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Görüntüle
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/urunler/${product.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Düzenle
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DeleteDialog
                    title="Ürünü Sil"
                    description={`"${product.name}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
                    endpoint={`/api/admin/products/${product.id}`}
                    onSuccess={() => router.refresh()}
                    trigger={
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sil
                      </DropdownMenuItem>
                    }
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
