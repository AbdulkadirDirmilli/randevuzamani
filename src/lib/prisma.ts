import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => {
  // DATABASE_URL'e göre karar ver:
  // - PostgreSQL URL (postgresql://) -> PostgreSQL
  // - File URL (file:) veya boş -> SQLite
  const databaseUrl = process.env.DATABASE_URL || "";
  const isPostgres = databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://");

  if (isPostgres) {
    // Production: PostgreSQL
    return new PrismaClient();
  }

  // Development: SQLite with better-sqlite3 adapter
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const adapter = new PrismaBetterSqlite3({
    url: databaseUrl || "file:./prisma/dev.db",
  });
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
