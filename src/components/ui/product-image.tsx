"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Kategoriye göre görsel temsili (emoji + gradient)
const categoryVisuals: Record<
  string,
  { emoji: string; gradient: string; label: string }
> = {
  viski:    { emoji: "🥃", gradient: "from-amber-700 to-amber-900",  label: "Viski" },
  whisky:   { emoji: "🥃", gradient: "from-amber-700 to-amber-900",  label: "Whisky" },
  whiskey:  { emoji: "🥃", gradient: "from-amber-700 to-amber-900",  label: "Whiskey" },
  sarap:    { emoji: "🍷", gradient: "from-red-800 to-red-950",       label: "Şarap" },
  wine:     { emoji: "🍷", gradient: "from-red-800 to-red-950",       label: "Wine" },
  bira:     { emoji: "🍺", gradient: "from-yellow-500 to-amber-700",  label: "Bira" },
  beer:     { emoji: "🍺", gradient: "from-yellow-500 to-amber-700",  label: "Beer" },
  raki:     { emoji: "🍶", gradient: "from-purple-700 to-purple-950", label: "Rakı" },
  rakı:     { emoji: "🍶", gradient: "from-purple-700 to-purple-950", label: "Rakı" },
  votka:    { emoji: "❄️", gradient: "from-sky-600 to-blue-900",      label: "Votka" },
  vodka:    { emoji: "❄️", gradient: "from-sky-600 to-blue-900",      label: "Vodka" },
  cin:      { emoji: "🍸", gradient: "from-teal-600 to-emerald-900",  label: "Cin" },
  gin:      { emoji: "🍸", gradient: "from-teal-600 to-emerald-900",  label: "Gin" },
  tekila:   { emoji: "🌵", gradient: "from-lime-600 to-green-900",    label: "Tekila" },
  tequila:  { emoji: "🌵", gradient: "from-lime-600 to-green-900",    label: "Tequila" },
  rom:      { emoji: "🏴‍☠️", gradient: "from-orange-700 to-amber-900", label: "Rom" },
  rum:      { emoji: "🏴‍☠️", gradient: "from-orange-700 to-amber-900", label: "Rum" },
  likor:    { emoji: "🍹", gradient: "from-pink-600 to-rose-900",     label: "Likör" },
  likör:    { emoji: "🍹", gradient: "from-pink-600 to-rose-900",     label: "Likör" },
  liqueur:  { emoji: "🍹", gradient: "from-pink-600 to-rose-900",     label: "Liqueur" },
  sampanya: { emoji: "🍾", gradient: "from-yellow-400 to-amber-600",  label: "Şampanya" },
  champagne:{ emoji: "🍾", gradient: "from-yellow-400 to-amber-600",  label: "Champagne" },
};

const defaultVisual = { emoji: "🍾", gradient: "from-slate-700 to-slate-900", label: "" };

// Ürün ismine göre kategori tahmin et (fallback için)
function inferCategoryFromName(name: string): keyof typeof categoryVisuals | null {
  const lower = name.toLowerCase();
  const keywords: [string[], keyof typeof categoryVisuals][] = [
    [["viski", "whisky", "whiskey", "bourbon"], "viski"],
    [["şarap", "sarap", "wine", "merlot", "cabernet", "chardonnay"], "sarap"],
    [["bira", "beer", "pilsen", "lager", "ale"], "bira"],
    [["rakı", "raki"], "raki"],
    [["votka", "vodka"], "votka"],
    [["cin", "gin"], "cin"],
    [["tekila", "tequila"], "tekila"],
    [["rom ", "rum"], "rom"],
    [["likör", "likor", "liqueur"], "likor"],
    [["şampanya", "sampanya", "champagne", "prosecco"], "sampanya"],
  ];
  for (const [words, cat] of keywords) {
    if (words.some((w) => lower.includes(w))) return cat;
  }
  return null;
}

// images alanını (JSON string veya null) güvenli şekilde ilk URL'e çevir
function parseFirstImage(images?: string | null): string | null {
  if (!images) return null;
  const trimmed = images.trim();
  if (!trimmed) return null;
  // JSON array mi?
  if (trimmed.startsWith("[")) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr) && typeof arr[0] === "string" && arr[0].length > 0) {
        return arr[0];
      }
    } catch {
      return null;
    }
    return null;
  }
  // Düz URL string
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return null;
}

function getVisual(categorySlug?: string | null, productName?: string) {
  const key = categorySlug?.toLowerCase();
  if (key && categoryVisuals[key]) return categoryVisuals[key];
  if (productName) {
    const inferred = inferCategoryFromName(productName);
    if (inferred) return categoryVisuals[inferred];
  }
  return defaultVisual;
}

interface ProductImageProps {
  productName: string;
  categorySlug?: string | null;
  brandName?: string | null;
  images?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
  xl: "h-48 w-48",
};

const emojiSizeClasses = {
  sm: "text-3xl",
  md: "text-5xl",
  lg: "text-6xl",
  xl: "text-8xl",
};

export function ProductImage({
  productName,
  categorySlug,
  brandName: _brandName,
  images,
  size = "lg",
  className,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const visual = getVisual(categorySlug, productName);
  const userImage = parseFirstImage(images);

  // Kullanıcı görseli varsa ve yüklenmediyse onu göster
  if (userImage && !imageError) {
    return (
      <div
        className={cn(
          "relative rounded-xl overflow-hidden bg-gradient-to-br",
          visual.gradient,
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={userImage}
          alt={productName}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
          sizes={size === "xl" ? "192px" : size === "lg" ? "128px" : size === "md" ? "96px" : "64px"}
          unoptimized
        />
      </div>
    );
  }

  // Fallback: kategori emoji + gradient
  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center bg-gradient-to-br",
        visual.gradient,
        sizeClasses[size],
        className
      )}
    >
      <span className={cn(emojiSizeClasses[size], "drop-shadow-lg")} aria-hidden="true">
        {visual.emoji}
      </span>
    </div>
  );
}

// Kategori sayfalarında kullanılan büyük görsel
export function CategoryImage({
  categorySlug,
  categoryName,
  className,
}: {
  categorySlug: string;
  categoryName: string;
  className?: string;
}) {
  const visual = getVisual(categorySlug, categoryName);

  return (
    <div
      className={cn(
        "aspect-square rounded-xl flex flex-col items-center justify-center bg-gradient-to-br p-4 relative overflow-hidden",
        visual.gradient,
        className
      )}
    >
      <span className="text-7xl drop-shadow-lg" aria-hidden="true">
        {visual.emoji}
      </span>
      <span className="mt-2 text-white font-semibold text-center drop-shadow-lg">
        {categoryName}
      </span>
    </div>
  );
}
