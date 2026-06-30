import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  walReady: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Aktifkan WAL sekali per proses. WAL meningkatkan konkurensi baca/tulis
// pada SQLite (penting walau offline: dev server + request bisa overlap).
// journal_mode=WAL tersimpan permanen di header DB; pragma lain per-koneksi.
if (!globalForPrisma.walReady) {
  globalForPrisma.walReady = true;
  void (async () => {
    try {
      // $queryRawUnsafe karena beberapa PRAGMA mengembalikan baris hasil.
      await prisma.$queryRawUnsafe("PRAGMA journal_mode=WAL;");
      await prisma.$queryRawUnsafe("PRAGMA busy_timeout=5000;");
      await prisma.$queryRawUnsafe("PRAGMA synchronous=NORMAL;");
      await prisma.$queryRawUnsafe("PRAGMA foreign_keys=ON;");
    } catch (err) {
      console.error("Gagal mengaktifkan PRAGMA WAL:", err);
    }
  })();
}
