import type { NextAuthConfig } from "next-auth";

/**
 * Konfigurasi edge-safe (tanpa Prisma/bcrypt) — dipakai oleh middleware.
 * Provider dengan akses DB ditambahkan di lib/auth.ts (runtime Node).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/invoices", nextUrl));
        }
        return true;
      }
      // Semua route lain wajib login.
      return isLoggedIn;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
