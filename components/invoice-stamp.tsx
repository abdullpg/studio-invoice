type Props = {
  status: string;
  /** Skala ukuran stempel (1 = default). */
  scale?: number;
};

/**
 * Stempel visual status pembayaran — elemen pembeda khas Studio Invoice.
 * Border ganda, miring, sedikit transparan agar terasa modern-simpel.
 * Sengaja memakai warna hex inline supaya konsisten saat di-export (JPG/PDF).
 */
export function InvoiceStamp({ status, scale = 1 }: Props) {
  const paid = status === "paid";
  const color = paid ? "#15803d" : "#b91c1c";
  const label = paid ? "LUNAS" : "BELUM LUNAS";

  return (
    <div
      aria-hidden
      style={{
        display: "inline-flex",
        transform: `rotate(-12deg) scale(${scale})`,
        opacity: 0.82,
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
            padding: paid ? "8px 22px" : "8px 16px",
            color,
            fontWeight: 800,
            fontSize: paid ? 30 : 24,
            lineHeight: 1,
            letterSpacing: 2,
            textTransform: "uppercase",
            fontFamily: "Arial, Helvetica, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
