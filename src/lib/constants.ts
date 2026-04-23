// Site bilgileri
export const SITE_CONFIG = {
  name: "Fiyat Takip",
  description: "Alkollü içecek fiyat takip ve bilgilendirme platformu",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  locale: "tr-TR",
  currency: "TRY",
  currencySymbol: "₺",
} as const;

// Sayfalama
export const PAGINATION = {
  defaultPageSize: 12,
  pageSizeOptions: [12, 24, 48, 96],
  maxPageSize: 100,
} as const;

// Ürün sabitleri
export const PRODUCT = {
  minPrice: 0,
  maxPrice: 1000000,
  defaultLowStockAlert: 10,
  maxImagesCount: 10,
  maxImageSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;

// Kullanıcı rolleri
export const USER_ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// İndirim türleri
export const DISCOUNT_TYPES = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
  BUY_X_GET_Y: "BUY_X_GET_Y",
} as const;

export type DiscountType = (typeof DISCOUNT_TYPES)[keyof typeof DISCOUNT_TYPES];

// Kampanya türleri
export const CAMPAIGN_TYPES = {
  SEASONAL: "SEASONAL",
  FLASH_SALE: "FLASH_SALE",
  CLEARANCE: "CLEARANCE",
  SPECIAL: "SPECIAL",
} as const;

export type CampaignType = (typeof CAMPAIGN_TYPES)[keyof typeof CAMPAIGN_TYPES];

// Bildirim türleri
export const NOTIFICATION_TYPES = {
  PRICE_DROP: "PRICE_DROP",
  PRICE_ALERT: "PRICE_ALERT",
  CAMPAIGN: "CAMPAIGN",
  SYSTEM: "SYSTEM",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// Import durumları
export const IMPORT_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type ImportStatus = (typeof IMPORT_STATUS)[keyof typeof IMPORT_STATUS];

// Stok durumu
export const STOCK_STATUS = {
  IN_STOCK: "in_stock",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
} as const;

export type StockStatus = (typeof STOCK_STATUS)[keyof typeof STOCK_STATUS];

// Sıralama seçenekleri
export const SORT_OPTIONS = [
  { value: "newest", label: "En Yeni" },
  { value: "oldest", label: "En Eski" },
  { value: "price_asc", label: "Fiyat (Düşükten Yükseğe)" },
  { value: "price_desc", label: "Fiyat (Yüksekten Düşüğe)" },
  { value: "name_asc", label: "İsim (A-Z)" },
  { value: "name_desc", label: "İsim (Z-A)" },
  { value: "popular", label: "En Popüler" },
] as const;

// Admin menü öğeleri
export const ADMIN_MENU_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/urunler", label: "Ürünler", icon: "Package" },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: "FolderTree" },
  { href: "/admin/markalar", label: "Markalar", icon: "Tag" },
  { href: "/admin/kampanyalar", label: "Kampanyalar", icon: "Megaphone" },
  { href: "/admin/indirimler", label: "İndirimler", icon: "Percent" },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: "Users" },
  { href: "/admin/import", label: "Import", icon: "Upload" },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: "Settings" },
] as const;

// Public navigasyon
export const NAV_ITEMS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/urunler", label: "Ürünler" },
  { href: "/kategoriler", label: "Kategoriler" },
  { href: "/markalar", label: "Markalar" },
  { href: "/kampanyalar", label: "Kampanyalar" },
] as const;
