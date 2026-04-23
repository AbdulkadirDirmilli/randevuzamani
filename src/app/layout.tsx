import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { OrganizationLd, WebSiteLd } from "@/components/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://fiyattakip.com";

export const metadata: Metadata = {
  title: {
    default: "Fiyat Takip - Alkollü İçecek Fiyat Bilgilendirme Platformu",
    template: "%s | Fiyat Takip",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fiyat Takip",
  },
  formatDetection: {
    telephone: false,
  },
  description:
    "Alkollü içecek fiyatlarını takip edin, karşılaştırın ve fiyat düşüşlerinde haberdar olun. Türkiye'nin fiyat bilgilendirme platformu.",
  keywords: [
    "fiyat takip",
    "alkollü içecek",
    "viski fiyat",
    "şarap fiyat",
    "bira fiyat",
    "rakı fiyat",
    "içki fiyat",
    "alkol fiyat karşılaştırma",
    "fiyat düşüşü",
    "fiyat alarmı",
  ],
  authors: [{ name: "Fiyat Takip" }],
  creator: "Fiyat Takip",
  publisher: "Fiyat Takip",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
    languages: {
      "tr-TR": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: BASE_URL,
    siteName: "Fiyat Takip",
    title: "Fiyat Takip - Alkollü İçecek Fiyat Bilgilendirme Platformu",
    description:
      "Alkollü içecek fiyatlarını takip edin, karşılaştırın ve fiyat düşüşlerinde haberdar olun.",
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Fiyat Takip",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fiyat Takip - Alkollü İçecek Fiyat Bilgilendirme Platformu",
    description:
      "Alkollü içecek fiyatlarını takip edin, karşılaştırın ve fiyat düşüşlerinde haberdar olun.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  category: "shopping",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <OrganizationLd />
        <WebSiteLd />
        {/* PWA Icons */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <link rel="mask-icon" href="/favicon.svg" color="#7c3aed" />
        <meta name="msapplication-TileColor" content="#7c3aed" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
