import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export type ImportType = "products" | "categories" | "brands";

export interface ImportResult {
  success: boolean;
  totalRows: number;
  imported: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export interface ProductRow {
  name: string;
  barcode?: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  currentPrice: string;
  basePrice?: string;
  stock?: string;
  categoryName?: string;
  brandName?: string;
}

export interface CategoryRow {
  name: string;
  description?: string;
  order?: string;
}

export interface BrandRow {
  name: string;
  description?: string;
}

function parseExcel(buffer: Buffer): Record<string, string>[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    raw: false,
    defval: "",
  });
}

function parseCsv(buffer: Buffer): Record<string, string>[] {
  const content = buffer.toString("utf-8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });
}

export function parseFile(
  buffer: Buffer,
  filename: string
): Record<string, string>[] {
  const ext = filename.toLowerCase().split(".").pop();

  if (ext === "xlsx" || ext === "xls") {
    return parseExcel(buffer);
  } else if (ext === "csv") {
    return parseCsv(buffer);
  } else {
    throw new Error("Desteklenmeyen dosya formatı. Excel veya CSV kullanın.");
  }
}

function normalizeColumnName(name: string): string {
  const normalized = name.toLowerCase().trim();

  const mappings: Record<string, string> = {
    "ürün adı": "name",
    "ürün": "name",
    "ad": "name",
    "isim": "name",
    "barkod": "barcode",
    "stok kodu": "sku",
    "açıklama": "description",
    "kısa açıklama": "shortDescription",
    "fiyat": "currentPrice",
    "güncel fiyat": "currentPrice",
    "satış fiyatı": "currentPrice",
    "maliyet": "basePrice",
    "alış fiyatı": "basePrice",
    "stok": "stock",
    "miktar": "stock",
    "adet": "stock",
    "kategori": "categoryName",
    "marka": "brandName",
    "sıra": "order",
  };

  return mappings[normalized] || normalized;
}

function normalizeRow<T>(row: Record<string, string>): T {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = normalizeColumnName(key);
    normalized[normalizedKey] = value;
  }

  return normalized as T;
}

function parseNumber(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export async function importProducts(
  data: Record<string, string>[],
  userId: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    totalRows: data.length,
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  const categoryCache = new Map<string, string>();
  const brandCache = new Map<string, string>();

  for (let i = 0; i < data.length; i++) {
    const rowNum = i + 2; // Excel row (header + 1-indexed)
    try {
      const row = normalizeRow<ProductRow>(data[i]);

      if (!row.name) {
        result.errors.push({ row: rowNum, message: "Ürün adı zorunlu" });
        result.skipped++;
        continue;
      }

      const currentPrice = parseNumber(row.currentPrice);
      if (!currentPrice || currentPrice <= 0) {
        result.errors.push({ row: rowNum, message: "Geçerli bir fiyat gerekli" });
        result.skipped++;
        continue;
      }

      // Get or create category
      let categoryId: string | null = null;
      if (row.categoryName) {
        const cachedCategoryId = categoryCache.get(row.categoryName);
        if (cachedCategoryId) {
          categoryId = cachedCategoryId;
        } else {
          let category = await prisma.category.findFirst({
            where: { name: { equals: row.categoryName } },
          });
          if (!category) {
            category = await prisma.category.create({
              data: {
                name: row.categoryName,
                slug: slugify(row.categoryName),
              },
            });
          }
          categoryId = category.id;
          categoryCache.set(row.categoryName, categoryId);
        }
      }

      // Get or create brand
      let brandId: string | null = null;
      if (row.brandName) {
        const cachedBrandId = brandCache.get(row.brandName);
        if (cachedBrandId) {
          brandId = cachedBrandId;
        } else {
          let brand = await prisma.brand.findFirst({
            where: { name: { equals: row.brandName } },
          });
          if (!brand) {
            brand = await prisma.brand.create({
              data: {
                name: row.brandName,
                slug: slugify(row.brandName),
              },
            });
          }
          brandId = brand.id;
          brandCache.set(row.brandName, brandId);
        }
      }

      const slug = slugify(row.name);
      const basePrice = parseNumber(row.basePrice) || currentPrice;
      const stock = parseNumber(row.stock) ?? 0;

      // Check if product exists by barcode or slug
      const existingProduct = row.barcode
        ? await prisma.product.findFirst({
            where: { OR: [{ barcode: row.barcode }, { slug }] },
          })
        : await prisma.product.findUnique({ where: { slug } });

      if (existingProduct) {
        // Update existing product
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            name: row.name,
            barcode: row.barcode || existingProduct.barcode,
            sku: row.sku || existingProduct.sku,
            description: row.description || existingProduct.description,
            shortDescription: row.shortDescription || existingProduct.shortDescription,
            basePrice,
            currentPrice,
            stock: Math.floor(stock),
            categoryId,
            brandId,
          },
        });

        // Add price history if price changed
        if (existingProduct.currentPrice !== currentPrice) {
          await prisma.priceHistory.create({
            data: {
              productId: existingProduct.id,
              price: currentPrice,
              oldPrice: existingProduct.currentPrice,
              source: "import",
            },
          });
        }

        result.updated++;
      } else {
        // Create new product
        const product = await prisma.product.create({
          data: {
            name: row.name,
            slug,
            barcode: row.barcode || null,
            sku: row.sku || null,
            description: row.description || null,
            shortDescription: row.shortDescription || null,
            basePrice,
            currentPrice,
            minPrice: currentPrice,
            maxPrice: currentPrice,
            stock: Math.floor(stock),
            categoryId,
            brandId,
          },
        });

        // Add initial price history
        await prisma.priceHistory.create({
          data: {
            productId: product.id,
            price: currentPrice,
            source: "import",
          },
        });

        result.imported++;
      }
    } catch (error) {
      result.errors.push({
        row: rowNum,
        message: error instanceof Error ? error.message : "Bilinmeyen hata",
      });
      result.skipped++;
    }
  }

  // Log import
  await prisma.importLog.create({
    data: {
      userId,
      type: "PRODUCT",
      totalRows: result.totalRows,
      imported: result.imported,
      updated: result.updated,
      skipped: result.skipped,
      errors: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
    },
  });

  return result;
}

export async function importCategories(
  data: Record<string, string>[],
  userId: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    totalRows: data.length,
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < data.length; i++) {
    const rowNum = i + 2;
    try {
      const row = normalizeRow<CategoryRow>(data[i]);

      if (!row.name) {
        result.errors.push({ row: rowNum, message: "Kategori adı zorunlu" });
        result.skipped++;
        continue;
      }

      const slug = slugify(row.name);
      const order = parseNumber(row.order) ?? 0;

      const existingCategory = await prisma.category.findUnique({
        where: { slug },
      });

      if (existingCategory) {
        await prisma.category.update({
          where: { id: existingCategory.id },
          data: {
            name: row.name,
            description: row.description || existingCategory.description,
            order: Math.floor(order),
          },
        });
        result.updated++;
      } else {
        await prisma.category.create({
          data: {
            name: row.name,
            slug,
            description: row.description || null,
            order: Math.floor(order),
          },
        });
        result.imported++;
      }
    } catch (error) {
      result.errors.push({
        row: rowNum,
        message: error instanceof Error ? error.message : "Bilinmeyen hata",
      });
      result.skipped++;
    }
  }

  await prisma.importLog.create({
    data: {
      userId,
      type: "CATEGORY",
      totalRows: result.totalRows,
      imported: result.imported,
      updated: result.updated,
      skipped: result.skipped,
      errors: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
    },
  });

  return result;
}

export async function importBrands(
  data: Record<string, string>[],
  userId: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    totalRows: data.length,
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < data.length; i++) {
    const rowNum = i + 2;
    try {
      const row = normalizeRow<BrandRow>(data[i]);

      if (!row.name) {
        result.errors.push({ row: rowNum, message: "Marka adı zorunlu" });
        result.skipped++;
        continue;
      }

      const slug = slugify(row.name);

      const existingBrand = await prisma.brand.findUnique({
        where: { slug },
      });

      if (existingBrand) {
        await prisma.brand.update({
          where: { id: existingBrand.id },
          data: {
            name: row.name,
            description: row.description || existingBrand.description,
          },
        });
        result.updated++;
      } else {
        await prisma.brand.create({
          data: {
            name: row.name,
            slug,
            description: row.description || null,
          },
        });
        result.imported++;
      }
    } catch (error) {
      result.errors.push({
        row: rowNum,
        message: error instanceof Error ? error.message : "Bilinmeyen hata",
      });
      result.skipped++;
    }
  }

  await prisma.importLog.create({
    data: {
      userId,
      type: "BRAND",
      totalRows: result.totalRows,
      imported: result.imported,
      updated: result.updated,
      skipped: result.skipped,
      errors: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
    },
  });

  return result;
}

export async function getImportLogs(limit = 10) {
  return prisma.importLog.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
