import { INVOICE_T, type Lang } from "@/lib/invoice-i18n";

type Props = {
  status: string;
  language?: Lang;
  /** Skala ukuran stempel (1 = default). */
  scale?: number;
};

/**
 * Stempel visual status pembayaran — elemen pembeda khas Studio Invoice.
 * Border ganda, miring, sedikit transparan agar terasa modern-simpel.
 * Memakai warna hex inline (dari palet) supaya konsisten saat di-export.
 */
export function InvoiceStamp({ status, language = "id", scale = 1 }: Props) {
  const t = INVOICE_T[language];
  const paid = status === "paid";
  // Palet: paid = Dark Slate Grey, unpaid = Brown Red.
  const color = paid ? "#335c67" : "#9e2a2b";
  const label = paid ? t.paid : t.unpaid;

  return (
    <div
      aria-hidden
      style={{
        display: "inline-flex",
        transform: `rotate(-12deg) scale(${scale})`,
        opacity: 0.85,
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          border: `3px solid ${color}`,
          borderRadius: 10,
          padding: 3,
        }}
      >
        <div
          style={{
            border: `1.5px solid ${color}`,
            borderRadius: 6,
            padding: "8px 16px",
            color,
            fontWeight: 800,
            fontSize: 26,
            lineHeight: 1,
            letterSpacing: 2,
            textTransform: "uppercase",
            fontFamily: "var(--font-sans), Arial, Helvetica, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
