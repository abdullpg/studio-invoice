export type Currency = "IDR" | "USD" | "EUR" | "CUSTOM";

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "IDR", label: "Rupiah (Rp)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "CUSTOM", label: "Custom…" },
];

export function symbolFor(currency: string, custom?: string | null): string {
  switch (currency) {
    case "IDR":
      return "Rp";
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "CUSTOM":
    default:
      return (custom ?? "").trim();
  }
}

export function formatMoney(
  amount: number,
  currency: string,
  custom?: string | null,
): string {
  const sym = symbolFor(currency, custom);
  const decimals = currency === "IDR" ? 0 : 2;
  const locale = currency === "IDR" ? "id-ID" : "en-US";
  const value = Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  return sym ? `${sym} ${formatted}` : formatted;
}
