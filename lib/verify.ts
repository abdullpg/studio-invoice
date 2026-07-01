import crypto from "crypto";

/**
 * Kode verifikasi keaslian invoice. Dihasilkan dari data inti invoice yang
 * di-HMAC dengan AUTH_SECRET milik studio. Karena butuh secret, kode ini tidak
 * bisa dipalsukan tanpa akses ke server — berfungsi sebagai segel anti-tamper.
 * Server-only (memakai crypto + secret).
 */
export function invoiceVerifyCode(input: {
  number: string;
  date: Date | string;
  clientName: string;
  total: number;
}): string {
  const secret = process.env.AUTH_SECRET || "studio-invoice-fallback";
  const day = new Date(input.date).toISOString().slice(0, 10);
  const payload = `${input.number}|${day}|${input.clientName}|${Math.round(input.total)}`;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
    .toUpperCase();
  return `${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}`;
}

function normalizeCode(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * Cek apakah `code` cocok dengan kode yang seharusnya untuk invoice ini.
 * Perbandingan timing-safe agar tidak bocor lewat timing attack. Toleran
 * terhadap tanda hubung/spasi pada input.
 */
export function isValidVerifyCode(
  input: {
    number: string;
    date: Date | string;
    clientName: string;
    total: number;
  },
  code: string,
): boolean {
  const expected = normalizeCode(invoiceVerifyCode(input));
  const got = normalizeCode(code);
  const a = Buffer.from(expected);
  const b = Buffer.from(got);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
