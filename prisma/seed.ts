import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Admin kullanıcı oluştur
  const hashedPassword = await bcrypt.hash("fiyattakip159", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@fiyattakip.com" },
    update: {},
    create: {
      email: "admin@fiyattakip.com",
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin user created:", admin.email);

  // Kategoriler
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "viski" },
      update: {},
      create: {
        name: "Viski",
        slug: "viski",
        description: "Viski çeşitleri",
        order: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "sarap" },
      update: {},
      create: {
        name: "Şarap",
        slug: "sarap",
        description: "Şarap çeşitleri",
        order: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "bira" },
      update: {},
      create: {
        name: "Bira",
        slug: "bira",
        description: "Bira çeşitleri",
        order: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "raki" },
      update: {},
      create: {
        name: "Rakı",
        slug: "raki",
        description: "Rakı çeşitleri",
        order: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "votka" },
      update: {},
      create: {
        name: "Votka",
        slug: "votka",
        description: "Votka çeşitleri",
        order: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: "cin" },
      update: {},
      create: {
        name: "Cin",
        slug: "cin",
        description: "Cin çeşitleri",
        order: 6,
      },
    }),
    prisma.category.upsert({
      where: { slug: "tekila" },
      update: {},
      create: {
        name: "Tekila",
        slug: "tekila",
        description: "Tekila çeşitleri",
        order: 7,
      },
    }),
    prisma.category.upsert({
      where: { slug: "rom" },
      update: {},
      create: {
        name: "Rom",
        slug: "rom",
        description: "Rom çeşitleri",
        order: 8,
      },
    }),
    prisma.category.upsert({
      where: { slug: "likor" },
      update: {},
      create: {
        name: "Likör",
        slug: "likor",
        description: "Likör çeşitleri",
        order: 9,
      },
    }),
  ]);
  console.log("Categories created:", categories.length);

  // Markalar
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: "johnnie-walker" },
      update: {},
      create: {
        name: "Johnnie Walker",
        slug: "johnnie-walker",
        description: "İskoç viski markası",
      },
    }),
    prisma.brand.upsert({
      where: { slug: "jack-daniels" },
      update: {},
      create: {
        name: "Jack Daniel's",
        slug: "jack-daniels",
        description: "Amerikan viski markası",
      },
    }),
    prisma.brand.upsert({
      where: { slug: "chivas-regal" },
      update: {},
      create: {
        name: "Chivas Regal",
        slug: "chivas-regal",
        description: "Premium İskoç viski markası",
      },
    }),
    prisma.brand.upsert({
      where: { slug: "yeni-raki" },
      update: {},
      create: {
        name: "Yeni Rakı",
        slug: "yeni-raki",
        description: "Türk rakı markası",
      },
    }),
    prisma.brand.upsert({
      where: { slug: "tekirdag" },
      update: {},
      create: {
        name: "Tekirdağ Rakısı",
        slug: "tekirdag",
        description: "Premium Türk rakı markası",
      },
    }),
    prisma.brand.upsert({
      where: { slug: "absolut" },
      update: {},
      create: {
        name: "Absolut",
        slug: "absolut",
        description: "İsveç votka markası",
      },
    }),
    prisma.brand.upsert({
      where: { slug: "smirnoff" },
      update: {},
      create: {
        name: "Smirnoff",
        slug: "smirnoff",
        description: "Votka markası",
      },
    }),
    prisma.brand.upsert({
      where: { slug: "efes" },
      update: {},
      create: {
        name: "Efes",
        slug: "efes",
        description: "Türk bira markası",
      },
    }),
    prisma.brand.upsert({
      where: { slug: "tuborg" },
      update: {},
      create: {
        name: "Tuborg",
        slug: "tuborg",
        description: "Danimarka bira markası",
      },
    }),
    prisma.brand.upsert({
      where: { slug: "corona" },
      update: {},
      create: {
        name: "Corona",
        slug: "corona",
        description: "Meksika bira markası",
      },
    }),
  ]);
  console.log("Brands created:", brands.length);

  // Örnek ürünler
  const viskiCategory = categories.find((c) => c.slug === "viski");
  const rakiCategory = categories.find((c) => c.slug === "raki");
  const biraCategory = categories.find((c) => c.slug === "bira");
  const votkaCategory = categories.find((c) => c.slug === "votka");

  const jwBrand = brands.find((b) => b.slug === "johnnie-walker");
  const jdBrand = brands.find((b) => b.slug === "jack-daniels");
  const yrBrand = brands.find((b) => b.slug === "yeni-raki");
  const efesBrand = brands.find((b) => b.slug === "efes");
  const absolutBrand = brands.find((b) => b.slug === "absolut");

  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: "johnnie-walker-red-label-1l" },
      update: {},
      create: {
        name: "Johnnie Walker Red Label 1L",
        slug: "johnnie-walker-red-label-1l",
        description: "Johnnie Walker Red Label, dünya'nın en çok satan İskoç viskisi.",
        shortDescription: "İskoç viskisi, 1 litre",
        basePrice: 1200,
        currentPrice: 1450,
        stock: 50,
        brandId: jwBrand?.id,
        categoryId: viskiCategory?.id,
        isFeatured: true,
        isNew: false,
      },
    }),
    prisma.product.upsert({
      where: { slug: "johnnie-walker-black-label-1l" },
      update: {},
      create: {
        name: "Johnnie Walker Black Label 1L",
        slug: "johnnie-walker-black-label-1l",
        description: "12 yıllık premium blended İskoç viskisi.",
        shortDescription: "Premium İskoç viskisi, 1 litre",
        basePrice: 2000,
        currentPrice: 2350,
        stock: 30,
        brandId: jwBrand?.id,
        categoryId: viskiCategory?.id,
        isFeatured: true,
        isNew: false,
      },
    }),
    prisma.product.upsert({
      where: { slug: "jack-daniels-no7-1l" },
      update: {},
      create: {
        name: "Jack Daniel's Old No.7 1L",
        slug: "jack-daniels-no7-1l",
        description: "Tennessee viski, kömür filtreleme yöntemiyle üretilmiştir.",
        shortDescription: "Tennessee viski, 1 litre",
        basePrice: 1400,
        currentPrice: 1650,
        stock: 40,
        brandId: jdBrand?.id,
        categoryId: viskiCategory?.id,
        isFeatured: true,
        isNew: false,
      },
    }),
    prisma.product.upsert({
      where: { slug: "yeni-raki-70cl" },
      update: {},
      create: {
        name: "Yeni Rakı 70cl",
        slug: "yeni-raki-70cl",
        description: "Türkiye'nin en sevilen rakısı.",
        shortDescription: "Türk rakısı, 70cl",
        basePrice: 450,
        currentPrice: 520,
        stock: 100,
        brandId: yrBrand?.id,
        categoryId: rakiCategory?.id,
        isFeatured: false,
        isNew: false,
      },
    }),
    prisma.product.upsert({
      where: { slug: "yeni-raki-1l" },
      update: {},
      create: {
        name: "Yeni Rakı 1L",
        slug: "yeni-raki-1l",
        description: "Türkiye'nin en sevilen rakısı, 1 litrelik özel boy.",
        shortDescription: "Türk rakısı, 1 litre",
        basePrice: 600,
        currentPrice: 720,
        stock: 80,
        brandId: yrBrand?.id,
        categoryId: rakiCategory?.id,
        isFeatured: true,
        isNew: false,
      },
    }),
    prisma.product.upsert({
      where: { slug: "efes-pilsen-50cl" },
      update: {},
      create: {
        name: "Efes Pilsen 50cl",
        slug: "efes-pilsen-50cl",
        description: "Türkiye'nin en çok tercih edilen birası.",
        shortDescription: "Türk birası, 50cl",
        basePrice: 35,
        currentPrice: 45,
        stock: 500,
        brandId: efesBrand?.id,
        categoryId: biraCategory?.id,
        isFeatured: false,
        isNew: false,
      },
    }),
    prisma.product.upsert({
      where: { slug: "absolut-vodka-1l" },
      update: {},
      create: {
        name: "Absolut Vodka 1L",
        slug: "absolut-vodka-1l",
        description: "İsveç'in premium votkası.",
        shortDescription: "İsveç votkası, 1 litre",
        basePrice: 800,
        currentPrice: 950,
        stock: 45,
        brandId: absolutBrand?.id,
        categoryId: votkaCategory?.id,
        isFeatured: true,
        isNew: true,
      },
    }),
  ]);
  console.log("Products created:", products.length);

  // Ayarlar
  await Promise.all([
    prisma.setting.upsert({
      where: { key: "site_name" },
      update: {},
      create: {
        key: "site_name",
        value: "Fiyat Takip",
        type: "string",
        group: "general",
      },
    }),
    prisma.setting.upsert({
      where: { key: "site_description" },
      update: {},
      create: {
        key: "site_description",
        value: "Alkollü içecek fiyat takip ve bilgilendirme platformu",
        type: "string",
        group: "general",
      },
    }),
    prisma.setting.upsert({
      where: { key: "global_discount" },
      update: {},
      create: {
        key: "global_discount",
        value: "0",
        type: "number",
        group: "pricing",
      },
    }),
    prisma.setting.upsert({
      where: { key: "currency" },
      update: {},
      create: {
        key: "currency",
        value: "TRY",
        type: "string",
        group: "general",
      },
    }),
    prisma.setting.upsert({
      where: { key: "currency_symbol" },
      update: {},
      create: {
        key: "currency_symbol",
        value: "₺",
        type: "string",
        group: "general",
      },
    }),
  ]);
  console.log("Settings created");

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
