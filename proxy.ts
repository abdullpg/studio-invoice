import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

// Next 16: konvensi "proxy" (menggantikan "middleware"). Edge-safe — hanya
// cek sesi via callback authorized, tanpa Prisma/bcrypt.
const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  // Jalan di semua route KECUALI: /api (dilindungi di handler-nya sendiri),
  // aset _next, file statis (mengandung titik), dan folder /uploads.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\..*).*)"],
};
