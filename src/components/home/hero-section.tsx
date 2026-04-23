"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Wine, GlassWater, Beer, Martini } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  productCount: number;
  categoryCount: number;
  brandCount: number;
}

// Animated counter component
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

// Floating animated shape
function FloatingShape({
  className,
  delay = 0,
  children
}: {
  className?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute pointer-events-none animate-float",
        className
      )}
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// Glowing orb component
function GlowingOrb({ className, color }: { className?: string; color: string }) {
  return (
    <div
      className={cn(
        "absolute rounded-full blur-3xl opacity-30 animate-pulse",
        className
      )}
      style={{ backgroundColor: color }}
    />
  );
}

export function HeroSection({ productCount, categoryCount, brandCount }: HeroSectionProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />

      {/* Glowing orbs */}
      <GlowingOrb className="w-96 h-96 -top-20 -right-20" color="#f59e0b" />
      <GlowingOrb className="w-80 h-80 top-1/2 -left-20" color="#8b5cf6" />
      <GlowingOrb className="w-64 h-64 bottom-10 right-1/4" color="#ec4899" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Floating icons */}
      <FloatingShape className="top-[15%] left-[10%] hidden lg:block" delay={0}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 backdrop-blur-sm border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <Wine className="w-8 h-8 text-amber-400" />
        </div>
      </FloatingShape>

      <FloatingShape className="top-[25%] right-[12%] hidden lg:block" delay={1}>
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/30 backdrop-blur-sm border border-purple-500/20 flex items-center justify-center shadow-lg shadow-purple-500/10">
          <GlassWater className="w-10 h-10 text-purple-400" />
        </div>
      </FloatingShape>

      <FloatingShape className="bottom-[30%] left-[8%] hidden lg:block" delay={2}>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 backdrop-blur-sm border border-yellow-500/20 flex items-center justify-center shadow-lg shadow-yellow-500/10">
          <Beer className="w-7 h-7 text-yellow-400" />
        </div>
      </FloatingShape>

      <FloatingShape className="bottom-[20%] right-[15%] hidden lg:block" delay={0.5}>
        <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/30 backdrop-blur-sm border border-pink-500/20 flex items-center justify-center shadow-lg shadow-pink-500/10 p-4">
          <Martini className="w-8 h-8 text-pink-400" />
        </div>
      </FloatingShape>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle" style={{ left: '10%', top: '20%' }} />
        <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle" style={{ left: '25%', top: '15%', animationDelay: '0.3s' }} />
        <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle" style={{ left: '40%', top: '30%', animationDelay: '0.6s' }} />
        <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle" style={{ left: '60%', top: '10%', animationDelay: '0.9s' }} />
        <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle" style={{ left: '75%', top: '25%', animationDelay: '1.2s' }} />
        <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle" style={{ left: '85%', top: '40%', animationDelay: '1.5s' }} />
        <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle" style={{ left: '15%', top: '60%', animationDelay: '0.2s' }} />
        <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle" style={{ left: '30%', top: '75%', animationDelay: '0.5s' }} />
        <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle" style={{ left: '50%', top: '65%', animationDelay: '0.8s' }} />
        <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle" style={{ left: '70%', top: '80%', animationDelay: '1.1s' }} />
        <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle" style={{ left: '90%', top: '70%', animationDelay: '1.4s' }} />
        <div className="absolute w-1.5 h-1.5 bg-amber-400/40 rounded-full animate-twinkle" style={{ left: '5%', top: '45%', animationDelay: '0.4s' }} />
        <div className="absolute w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-twinkle" style={{ left: '95%', top: '55%', animationDelay: '0.7s' }} />
        <div className="absolute w-1.5 h-1.5 bg-pink-400/40 rounded-full animate-twinkle" style={{ left: '45%', top: '85%', animationDelay: '1s' }} />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge className="px-5 py-2 text-sm bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-white border border-white/10 backdrop-blur-md shadow-xl">
              <Sparkles className="h-4 w-4 mr-2 text-amber-400" />
              Türkiye&apos;nin Fiyat Takip Platformu
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
            <span className="inline-block bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
              Alkollü İçecek
            </span>
            <br />
            <span className="inline-block bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 bg-clip-text text-transparent animate-gradient-shift">
              Fiyat Takip Platformu
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Fiyatları karşılaştırın, indirimleri takip edin, fiyat düşüşlerinde
            anında haberdar olun.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="text-base px-8 py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105 border-0"
              asChild
            >
              <Link href="/urunler">
                Ürünleri İncele
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 py-6 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm transition-all duration-300"
              asChild
            >
              <Link href="/kayit">Ücretsiz Kayıt Ol</Link>
            </Button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
            {/* Product Count */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-amber-500/30 transition-all duration-300 hover:scale-105">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-1">
                  <AnimatedCounter value={productCount} suffix="+" />
                </div>
                <div className="text-sm sm:text-base text-white/60 font-medium">Ürün</div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full" />
              </div>
            </div>

            {/* Category Count */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-purple-500/30 transition-all duration-300 hover:scale-105">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                  <AnimatedCounter value={categoryCount} suffix="+" />
                </div>
                <div className="text-sm sm:text-base text-white/60 font-medium">Kategori</div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full" />
              </div>
            </div>

            {/* Brand Count */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-pink-500/30 transition-all duration-300 hover:scale-105">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-1">
                  <AnimatedCounter value={brandCount} suffix="+" />
                </div>
                <div className="text-sm sm:text-base text-white/60 font-medium">Marka</div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
