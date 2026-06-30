/** Konversi Date/string ke format input <input type="date"> (yyyy-mm-dd) lokal.
 *  Modul ini bebas dependensi server (aman dipakai di client component). */
export function toDateInput(d?: Date | string | null): string {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const off = date.getTimezoneOffset();
  return new Date(date.getTime() - off * 60000).toISOString().slice(0, 10);
}
