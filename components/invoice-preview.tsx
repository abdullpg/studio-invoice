import * as React from "react";
import { InvoiceStamp } from "@/components/invoice-stamp";
import { computeTotals, lineTotal } from "@/lib/totals";
import { formatMoney } from "@/lib/currency";

export type PreviewItem = { desc: string; qty: number; price: number };
export type PreviewInvoice = {
  number: string;
  date: string | Date;
  dueDate?: string | Date | null;
  clientName: string;
  clientContact?: string | null;
  currency: string;
  currencySymbol?: string | null;
  discountType: string;
  discountValue: number;
  status: string;
  notes?: string | null;
  items: PreviewItem[];
};
export type PreviewProfile = {
  name: string;
  address?: string | null;
  contact?: string | null;
  bankInfo?: string | null;
  logoUrl?: string | null;
};

const ACCENT = "#d98e48";
const INK = "#1c1a17";
const MUTED = "#6b6257";
const LINE = "#e7e2da";

function fmtDate(d?: string | Date | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Render kertas invoice. Memakai warna hex eksplisit (bukan CSS variable /
 * dark mode) supaya tampilan & hasil export JPG/PDF selalu konsisten.
 */
export const InvoicePreview = React.forwardRef<HTMLDivElement, {
  invoice: PreviewInvoice;
  profile: PreviewProfile;
}>(function InvoicePreview({ invoice, profile }, ref) {
  const cur = invoice.currency;
  const sym = invoice.currencySymbol;
  const { subtotal, discount, total } = computeTotals(
    invoice.items,
    invoice.discountType,
    invoice.discountValue,
  );
  const money = (n: number) => formatMoney(n, cur, sym);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 800,
        margin: "0 auto",
        background: "#ffffff",
        color: INK,
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "48px 44px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          {profile.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logoUrl}
              alt={profile.name}
              crossOrigin="anonymous"
              style={{
                width: 56,
                height: 56,
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          ) : null}
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.3 }}>
              {profile.name}
            </div>
            {profile.address ? (
              <div style={{ fontSize: 12, color: MUTED, whiteSpace: "pre-line", marginTop: 2 }}>
                {profile.address}
              </div>
            ) : null}
            {profile.contact ? (
              <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                {profile.contact}
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 4,
              color: ACCENT,
            }}
          >
            INVOICE
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>
            {invoice.number}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: LINE, margin: "24px 0" }} />

      {/* Meta: tagihan kepada + tanggal */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: 1 }}>
            Tagihan kepada
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>
            {invoice.clientName}
          </div>
          {invoice.clientContact ? (
            <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
              {invoice.clientContact}
            </div>
          ) : null}
        </div>
        <div style={{ textAlign: "right", fontSize: 12 }}>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: MUTED }}>Tanggal: </span>
            <span style={{ fontWeight: 600 }}>{fmtDate(invoice.date)}</span>
          </div>
          {invoice.dueDate ? (
            <div>
              <span style={{ color: MUTED }}>Jatuh tempo: </span>
              <span style={{ fontWeight: 600 }}>{fmtDate(invoice.dueDate)}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Item */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 24,
          fontSize: 13,
        }}
      >
        <thead>
          <tr style={{ background: "#faf6f0", color: INK }}>
            <th style={th("left", 36)}>#</th>
            <th style={th("left")}>Deskripsi</th>
            <th style={th("right", 60)}>Qty</th>
            <th style={th("right", 130)}>Harga</th>
            <th style={th("right", 140)}>Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${LINE}` }}>
              <td style={td("left")}>{i + 1}</td>
              <td style={td("left")}>{it.desc}</td>
              <td style={td("right")}>{it.qty}</td>
              <td style={td("right")}>{money(it.price)}</td>
              <td style={{ ...td("right"), fontWeight: 600 }}>{money(lineTotal(it))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
        <div style={{ width: 280, fontSize: 13 }}>
          <Row label="Subtotal" value={money(subtotal)} muted />
          {discount > 0 ? (
            <Row
              label={
                invoice.discountType === "percent"
                  ? `Diskon (${invoice.discountValue}%)`
                  : "Diskon"
              }
              value={`- ${money(discount)}`}
              muted
            />
          ) : null}
          <div style={{ height: 1, background: LINE, margin: "8px 0" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            <span>Total</span>
            <span style={{ color: ACCENT }}>{money(total)}</span>
          </div>
        </div>
      </div>

      {/* Footer: catatan + rekening + stempel */}
      <div
        style={{
          position: "relative",
          marginTop: 32,
          display: "flex",
          justifyContent: "space-between",
          gap: 24,
          minHeight: 96,
        }}
      >
        <div style={{ maxWidth: 360 }}>
          {invoice.notes ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: 1 }}>
                Catatan
              </div>
              <div style={{ fontSize: 12, color: INK, whiteSpace: "pre-line", marginTop: 3 }}>
                {invoice.notes}
              </div>
            </div>
          ) : null}
          {profile.bankInfo ? (
            <div>
              <div style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: 1 }}>
                Pembayaran
              </div>
              <div style={{ fontSize: 12, color: INK, whiteSpace: "pre-line", marginTop: 3 }}>
                {profile.bankInfo}
              </div>
            </div>
          ) : null}
        </div>

        {/* Stempel */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            flex: 1,
          }}
        >
          <InvoiceStamp status={invoice.status} />
        </div>
      </div>
    </div>
  );
});

function th(align: "left" | "right", width?: number): React.CSSProperties {
  return {
    textAlign: align,
    padding: "9px 10px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    width,
  };
}
function td(align: "left" | "right"): React.CSSProperties {
  return { textAlign: align, padding: "9px 10px", verticalAlign: "top" };
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
      <span style={{ color: muted ? MUTED : INK }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
