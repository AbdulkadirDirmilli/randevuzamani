"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Ürün ismine göre Unsplash görselleri
const productNameImages: Record<string, string> = {
  // Rakı
  "yeni raki": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop",
  "yeni rakı": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop",
  "tekirdag": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop",
  "tekirdağ": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop",
  "efe": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop",

  // Viski
  "jack daniels": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=400&fit=crop",
  "johnnie walker": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=400&fit=crop",
  "chivas": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop",
  "jameson": "https://images.unsplash.com/photo-1598018553943-93a8ab0c69f4?w=400&h=400&fit=crop",
  "ballantine": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=400&fit=crop",

  // Bira
  "efes": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=400&fit=crop",
  "tuborg": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=400&fit=crop",
  "carlsberg": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=400&fit=crop",
  "heineken": "https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=400&h=400&fit=crop",
  "corona": "https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=400&h=400&fit=crop",
  "miller": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=400&fit=crop",

  // Votka
  "absolut": "https://images.unsplash.com/photo-1550985543-49bee3167284?w=400&h=400&fit=crop",
  "smirnoff": "https://images.unsplash.com/photo-1550985543-49bee3167284?w=400&h=400&fit=crop",
  "grey goose": "https://images.unsplash.com/photo-1550985543-49bee3167284?w=400&h=400&fit=crop",

  // Şarap
  "sarap": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop",
  "wine": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop",
  "kirmizi": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop",
  "kırmızı": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop",
  "beyaz": "https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=400&h=400&fit=crop",

  // Cin
  "gordon": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop",
  "bombay": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop",
  "beefeater": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop",

  // Rom
  "bacardi": "https://images.unsplash.com/photo-1598018553943-93a8ab0c69f4?w=400&h=400&fit=crop",
  "havana": "https://images.unsplash.com/photo-1598018553943-93a8ab0c69f4?w=400&h=400&fit=crop",
  "captain morgan": "https://images.unsplash.com/photo-1598018553943-93a8ab0c69f4?w=400&h=400&fit=crop",

  // Tekila
  "jose cuervo": "https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=400&h=400&fit=crop",
  "patron": "https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=400&h=400&fit=crop",

  // Şampanya
  "moet": "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=400&h=400&fit=crop",
  "dom perignon": "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=400&h=400&fit=crop",
  "veuve": "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=400&h=400&fit=crop",
};

// Kategori bazlı Unsplash görselleri
const categoryImages: Record<string, string> = {
  viski: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=400&fit=crop",
  whisky: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=400&fit=crop",
  whiskey: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=400&fit=crop",
  sarap: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop",
  wine: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop",
  bira: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=400&fit=crop",
  beer: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=400&fit=crop",
  raki: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop",
  votka: "https://images.unsplash.com/photo-1550985543-49bee3167284?w=400&h=400&fit=crop",
  vodka: "https://images.unsplash.com/photo-1550985543-49bee3167284?w=400&h=400&fit=crop",
  cin: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop",
  gin: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop",
  tekila: "https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=400&h=400&fit=crop",
  tequila: "https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=400&h=400&fit=crop",
  rom: "https://images.unsplash.com/photo-1598018553943-93a8ab0c69f4?w=400&h=400&fit=crop",
  rum: "https://images.unsplash.com/photo-1598018553943-93a8ab0c69f4?w=400&h=400&fit=crop",
  likör: "https://images.unsplash.com/photo-1582819509237-d24b15a8b6cd?w=400&h=400&fit=crop",
  liqueur: "https://images.unsplash.com/photo-1582819509237-d24b15a8b6cd?w=400&h=400&fit=crop",
  sampanya: "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=400&h=400&fit=crop",
  champagne: "https://images.unsplash.com/photo-1549918864-48ac978761a4?w=400&h=400&fit=crop",
};

// Marka bazlı renk gradyanları
const brandGradients: Record<string, string> = {
  "jack daniels": "from-amber-900 to-amber-700",
  "johnnie walker": "from-amber-800 to-yellow-600",
  "chivas regal": "from-red-900 to-red-700",
  "jameson": "from-green-800 to-green-600",
  "absolut": "from-blue-900 to-blue-700",
  "smirnoff": "from-red-700 to-red-500",
  "bacardi": "from-red-800 to-orange-600",
  "havana club": "from-amber-700 to-yellow-500",
  "gordon's": "from-green-700 to-teal-500",
  "bombay": "from-blue-800 to-cyan-600",
  "hennessy": "from-amber-900 to-orange-700",
  "yeni raki": "from-purple-900 to-purple-700",
  "yeni rakı": "from-purple-900 to-purple-700",
  "efes": "from-blue-700 to-blue-500",
  "tuborg": "from-green-600 to-lime-500",
  "corona": "from-yellow-500 to-amber-400",
  "heineken": "from-green-700 to-green-500",
};

// Varsayılan gradient
const defaultGradient = "from-slate-700 to-slate-500";

// Varsayılan görsel
const defaultImage = "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop";

interface ProductImageProps {
  productName: string;
  categorySlug?: string | null;
  brandName?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
  xl: "h-48 w-48",
};

// Ürün ismine göre görsel bul
function getImageByProductName(productName: string): string | null {
  const lowerName = productName.toLowerCase();

  for (const [key, url] of Object.entries(productNameImages)) {
    if (lowerName.includes(key)) {
      return url;
    }
  }

  return null;
}

// Marka bazlı gradient bul
function getBrandGradient(brandName?: string | null): string {
  if (!brandName) return defaultGradient;

  const brandKey = brandName.toLowerCase();
  for (const [key, value] of Object.entries(brandGradients)) {
    if (brandKey.includes(key)) {
      return value;
    }
  }

  return defaultGradient;
}

export function ProductImage({
  productName,
  categorySlug,
  brandName,
  size = "lg",
  className,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);

  // Önce ürün ismine göre görsel ara
  const productImage = getImageByProductName(productName);

  // Sonra kategori bazlı görsel
  const categoryKey = categorySlug?.toLowerCase() || "";
  const categoryImage = categoryImages[categoryKey];

  // Kullanılacak görsel (öncelik: ürün ismi > kategori > varsayılan)
  const imageUrl = productImage || categoryImage || defaultImage;

  // Marka bazlı gradient
  const gradient = getBrandGradient(brandName);

  if (imageError) {
    // Fallback: gradient arka plan + baş harf
    return (
      <div
        className={cn(
          "rounded-xl flex items-center justify-center bg-gradient-to-br",
          gradient,
          sizeClasses[size],
          className
        )}
      >
        <span className="text-white font-bold text-2xl">
          {productName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-gradient-to-br",
        gradient,
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={imageUrl}
        alt={productName}
        fill
        className="object-cover"
        onError={() => setImageError(true)}
        sizes={size === "xl" ? "192px" : size === "lg" ? "128px" : size === "md" ? "96px" : "64px"}
      />
    </div>
  );
}

// Kategori kartları için büyük görsel
export function CategoryImage({
  categorySlug,
  categoryName,
  className,
}: {
  categorySlug: string;
  categoryName: string;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);

  const categoryKey = categorySlug.toLowerCase();
  const imageUrl = categoryImages[categoryKey] || defaultImage;

  const getCategoryGradient = () => {
    switch (categoryKey) {
      case "viski": return "from-amber-600 to-amber-800";
      case "sarap": return "from-red-600 to-red-800";
      case "bira": return "from-yellow-500 to-amber-600";
      case "raki": return "from-purple-600 to-purple-800";
      case "votka": return "from-blue-500 to-blue-700";
      case "cin": return "from-teal-500 to-teal-700";
      case "tekila": return "from-lime-500 to-green-600";
      case "rom": return "from-orange-500 to-orange-700";
      case "likör": return "from-pink-500 to-pink-700";
      case "sampanya": return "from-yellow-400 to-amber-500";
      default: return "from-slate-600 to-slate-800";
    }
  };

  if (imageError) {
    return (
      <div
        className={cn(
          "aspect-square rounded-xl flex flex-col items-center justify-center bg-gradient-to-br p-4",
          getCategoryGradient(),
          className
        )}
      >
        <span className="text-white font-bold text-3xl mb-2">
          {categoryName.charAt(0).toUpperCase()}
        </span>
        <span className="text-white font-medium text-sm text-center">{categoryName}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "aspect-square rounded-xl overflow-hidden relative bg-gradient-to-br",
        getCategoryGradient(),
        className
      )}
    >
      <Image
        src={imageUrl}
        alt={categoryName}
        fill
        className="object-cover"
        onError={() => setImageError(true)}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-4">
        <span className="text-white font-semibold text-center drop-shadow-lg">{categoryName}</span>
      </div>
    </div>
  );
}
