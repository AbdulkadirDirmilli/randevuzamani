"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
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
import { formatDateShort } from "@/lib/format";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: Date;
  _count: { products: number };
}

interface BrandTableProps {
  brands: Brand[];
}

export function BrandTable({ brands }: BrandTableProps) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Marka</TableHead>
          <TableHead className="hidden sm:table-cell">Slug</TableHead>
          <TableHead className="hidden md:table-cell">Website</TableHead>
          <TableHead>Ürün</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead className="hidden lg:table-cell">Tarih</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {brands.map((brand) => (
          <TableRow key={brand.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-semibold shrink-0">
                  {brand.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate max-w-[100px] sm:max-w-none">
                    {brand.name}
                  </p>
                  {brand.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 hidden sm:block">
                      {brand.description}
                    </p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground">
              {brand.slug}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {brand.website ? (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Link
                </a>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>{brand._count.products}</TableCell>
            <TableCell>
              <Badge variant={brand.isActive ? "default" : "secondary"}>
                {brand.isActive ? "Aktif" : "Pasif"}
              </Badge>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {formatDateShort(brand.createdAt)}
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
                    <Link href={`/admin/markalar/${brand.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Düzenle
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DeleteDialog
                    title="Markayı Sil"
                    description={`"${brand.name}" markasını silmek istediğinizden emin misiniz? Bu markada ürün varsa silme işlemi başarısız olacaktır.`}
                    endpoint={`/api/admin/brands/${brand.id}`}
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
