import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

// Fiyat formatlama
export function formatPrice(
  price: number,
  options?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const {
    currency = "TRY",
    locale = "tr-TR",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options || {};

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(price);
}

// Kısa fiyat formatlama (K, M gibi)
export function formatPriceShort(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M ₺`;
  }
  if (price >= 1000) {
    return `${(price / 1000).toFixed(1)}K ₺`;
  }
  return formatPrice(price);
}

// İndirim yüzdesi hesaplama
export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number
): number {
  if (originalPrice <= 0) return 0;
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return Math.round(discount);
}

// Tarih formatlama
export function formatDate(
  date: Date | string | null | undefined,
  formatStr: string = "d MMMM yyyy"
): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(dateObj)) return "";
  return format(dateObj, formatStr, { locale: tr });
}

// Tarih ve saat formatlama
export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, "d MMMM yyyy, HH:mm");
}

// Kısa tarih formatlama
export function formatDateShort(date: Date | string | null | undefined): string {
  return formatDate(date, "dd.MM.yyyy");
}

// Göreceli tarih (2 gün önce, vs.)
export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(dateObj)) return "";
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: tr });
}

// Sayı formatlama
export function formatNumber(
  num: number,
  options?: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const {
    locale = "tr-TR",
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options || {};

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(num);
}

// Stok durumu metni
export function formatStockStatus(stock: number, lowStockAlert: number = 10): {
  text: string;
  variant: "success" | "warning" | "error";
} {
  if (stock <= 0) {
    return { text: "Stokta Yok", variant: "error" };
  }
  if (stock <= lowStockAlert) {
    return { text: `Son ${stock} Adet`, variant: "warning" };
  }
  return { text: "Stokta Var", variant: "success" };
}

// Dosya boyutu formatlama
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
