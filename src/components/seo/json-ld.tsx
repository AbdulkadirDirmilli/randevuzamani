import { SITE_CONFIG } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://fiyattakip.com";

interface OrganizationLdProps {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
}

export function OrganizationLd({
  name = SITE_CONFIG.name,
  description = SITE_CONFIG.description,
  url = BASE_URL,
  logo = `${BASE_URL}/logo.png`,
}: OrganizationLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    description,
    url,
    logo,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "Turkish",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface WebSiteLdProps {
  name?: string;
  description?: string;
  url?: string;
}

export function WebSiteLd({
  name = SITE_CONFIG.name,
  description = SITE_CONFIG.description,
  url = BASE_URL,
}: WebSiteLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/urunler?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface ProductLdProps {
  name: string;
  description?: string;
  image?: string;
  sku?: string;
  barcode?: string;
  brand?: string;
  category?: string;
  price: number;
  priceCurrency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  url: string;
  lowPrice?: number;
  highPrice?: number;
}

export function ProductLd({
  name,
  description,
  image,
  sku,
  barcode,
  brand,
  category,
  price,
  priceCurrency = "TRY",
  availability = "InStock",
  url,
  lowPrice,
  highPrice,
}: ProductLdProps) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image || `${BASE_URL}/placeholder.jpg`,
    sku,
    gtin13: barcode,
    url,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency,
      availability: `https://schema.org/${availability}`,
      url,
      priceValidUntil: new Date(
        new Date().setMonth(new Date().getMonth() + 1)
      ).toISOString(),
    },
  };

  if (brand) {
    jsonLd.brand = {
      "@type": "Brand",
      name: brand,
    };
  }

  if (category) {
    jsonLd.category = category;
  }

  // Add aggregate offer if we have price range
  if (lowPrice !== undefined && highPrice !== undefined && lowPrice !== highPrice) {
    jsonLd.offers = {
      "@type": "AggregateOffer",
      lowPrice,
      highPrice,
      priceCurrency,
      offerCount: 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbLd({ items }: BreadcrumbLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQLdProps {
  items: FAQItem[];
}

export function FAQLd({ items }: FAQLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface LocalBusinessLdProps {
  name?: string;
  description?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone?: string;
  openingHours?: string[];
}

export function LocalBusinessLd({
  name = SITE_CONFIG.name,
  description = SITE_CONFIG.description,
  address,
  telephone,
  openingHours,
}: LocalBusinessLdProps) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Store",
    name,
    description,
    url: BASE_URL,
    image: `${BASE_URL}/logo.png`,
  };

  if (address) {
    jsonLd.address = {
      "@type": "PostalAddress",
      ...address,
    };
  }

  if (telephone) {
    jsonLd.telephone = telephone;
  }

  if (openingHours) {
    jsonLd.openingHoursSpecification = openingHours.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours,
    }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
