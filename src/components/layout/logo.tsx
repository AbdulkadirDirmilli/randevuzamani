import Link from "next/link";
import { Wine } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Wine className="h-5 w-5 text-primary-foreground" />
      </div>
      {showText && (
        <span className="font-bold text-xl">Fiyat Takip</span>
      )}
    </Link>
  );
}
