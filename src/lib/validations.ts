import { z } from "zod";

// Auth validasyonları
export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    email: z.string().email("Geçerli bir e-posta adresi girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

// Ürün validasyonları
export const productSchema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır"),
  slug: z.string().min(2, "Slug en az 2 karakter olmalıdır").optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(200, "Kısa açıklama en fazla 200 karakter olabilir").optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  basePrice: z.number().min(0, "Taban fiyat 0'dan küçük olamaz"),
  currentPrice: z.number().min(0, "Güncel fiyat 0'dan küçük olamaz"),
  discountedPrice: z.number().min(0).optional().nullable(),
  minPrice: z.number().min(0).optional().nullable(),
  maxPrice: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0, "Stok 0'dan küçük olamaz").default(0),
  lowStockAlert: z.number().int().min(0).default(10),
  brandId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  metaTitle: z.string().max(60, "Meta başlık en fazla 60 karakter olabilir").optional(),
  metaDescription: z.string().max(160, "Meta açıklama en fazla 160 karakter olabilir").optional(),
});

// Kategori validasyonları
export const categorySchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter olmalıdır"),
  slug: z.string().min(2, "Slug en az 2 karakter olmalıdır").optional(),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// Marka validasyonları
export const brandSchema = z.object({
  name: z.string().min(2, "Marka adı en az 2 karakter olmalıdır"),
  slug: z.string().min(2, "Slug en az 2 karakter olmalıdır").optional(),
  description: z.string().optional(),
  website: z.string().url("Geçerli bir URL girin").optional().nullable(),
  isActive: z.boolean().default(true),
});

// İndirim validasyonları
export const discountSchema = z.object({
  name: z.string().min(2, "İndirim adı en az 2 karakter olmalıdır"),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED", "BUY_X_GET_Y"]),
  value: z.number().min(0, "İndirim değeri 0'dan küçük olamaz"),
  minPurchase: z.number().min(0).optional().nullable(),
  maxDiscount: z.number().min(0).optional().nullable(),
  code: z.string().optional().nullable(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean().default(true),
});

// Kampanya validasyonları
export const campaignSchema = z.object({
  name: z.string().min(2, "Kampanya adı en az 2 karakter olmalıdır"),
  slug: z.string().min(2, "Slug en az 2 karakter olmalıdır").optional(),
  description: z.string().optional(),
  type: z.enum(["SEASONAL", "FLASH_SALE", "CLEARANCE", "SPECIAL"]),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().min(0, "İndirim değeri 0'dan küçük olamaz"),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

// Fiyat alarmı validasyonları
export const priceAlertSchema = z.object({
  productId: z.string().min(1, "Ürün seçilmelidir"),
  targetPrice: z.number().min(0, "Hedef fiyat 0'dan küçük olamaz"),
});

// Arama/filtreleme validasyonları
export const searchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

// Toplu fiyat güncelleme validasyonu
export const bulkPriceUpdateSchema = z.object({
  productIds: z.array(z.string()).min(1, "En az bir ürün seçilmelidir"),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number(),
  operation: z.enum(["INCREASE", "DECREASE"]),
});

// Export type'lar
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BrandInput = z.infer<typeof brandSchema>;
export type DiscountInput = z.infer<typeof discountSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
export type PriceAlertInput = z.infer<typeof priceAlertSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;
export type BulkPriceUpdateInput = z.infer<typeof bulkPriceUpdateSchema>;
