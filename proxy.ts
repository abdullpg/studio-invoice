import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

// Next 16: konvensi "proxy" (menggantikan "middleware"). Edge-safe — hanya
// cek sesi via callback authorized, tanpa Prisma/bcrypt.
const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  // Jalan di semua route KECUALI: /api (dilindungi di handler-nya sendiri),
  // SELURUH /_next (termasuk webpack-hmr — kalau diproteksi, websocket HMR
  // gagal & memunculkan "Unauthorized", terutama saat diakses lewat tunnel
  // seperti cloudflared), favicon, /uploads, dan file statis (mengandung titik).
  matcher: ["/((?!api|_next|verify|favicon.ico|uploads|.*\\..*).*)"],
};
