"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  parent: { name: string } | null;
  _count: { products: number };
}

interface CategoryTableProps {
  categories: Category[];
}

export function CategoryTable({ categories }: CategoryTableProps) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kategori</TableHead>
          <TableHead className="hidden sm:table-cell">Slug</TableHead>
          <TableHead className="hidden md:table-cell">Üst Kategori</TableHead>
          <TableHead>Ürün</TableHead>
          <TableHead className="hidden lg:table-cell">Sıra</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead className="hidden lg:table-cell">Tarih</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground">
              {category.slug}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {category.parent?.name || "-"}
            </TableCell>
            <TableCell>{category._count.products}</TableCell>
            <TableCell className="hidden lg:table-cell">{category.order}</TableCell>
            <TableCell>
              <Badge variant={category.isActive ? "default" : "secondary"}>
                {category.isActive ? "Aktif" : "Pasif"}
              </Badge>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {formatDateShort(category.createdAt)}
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
                    <Link href={`/admin/kategoriler/${category.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Düzenle
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DeleteDialog
                    title="Kategoriyi Sil"
                    description={`"${category.name}" kategorisini silmek istediğinizden emin misiniz? Bu kategoride ürün varsa silme işlemi başarısız olacaktır.`}
                    endpoint={`/api/admin/categories/${category.id}`}
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
