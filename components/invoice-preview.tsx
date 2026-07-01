import * as React from "react";
import { InvoiceStamp } from "@/components/invoice-stamp";
import { computeTotals, lineTotal } from "@/lib/totals";
import { formatMoney } from "@/lib/currency";
import { INVOICE_T, invoiceLang } from "@/lib/invoice-i18n";

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
  qrisUrl?: string | null;
  tagline?: string | null;
  watermarkText?: string | null;
  language?: string | null;
};

// Palet
const INK = "#1c1a17";
const SLATE = "#335c67"; // Dark Slate Grey
const CREAM = "#fff3b0"; // Vanilla Custard
const BRONZE = "#e09f3e"; // Honey Bronze
const BRED = "#9e2a2b"; // Brown Red
const BORD = "#540b0e"; // Night Bordeaux
const MUTED = "#6b6257";
const LINE = "#e5ddc9";
const ZEBRA = "#fdf7e3";
const SANS = "var(--font-sans), system-ui, Arial, sans-serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

function fmtDate(d: string | Date | null | undefined, locale: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Watermark kepemilikan: teks diulang diagonal, sangat tipis.
function watermarkUri(text: string): string {
  const t = (text || "STUDIO").toUpperCase().replace(/[<>&]/g, "").slice(0, 28);
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='380' height='220'>` +
    `<text x='8' y='150' font-family='sans-serif' font-size='24' font-weight='800' ` +
    `fill='#335c67' fill-opacity='0.05' transform='rotate(-24 8 150)'>${t}</text>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export const InvoicePreview = React.forwardRef<
  HTMLDivElement,
  {
    invoice: PreviewInvoice;
    profile: PreviewProfile;
    verifyCode?: string;
  }
>(function InvoicePreview({ invoice, profile, verifyCode }, ref) {
  const lang = invoiceLang(profile.language);
  const t = INVOICE_T[lang];
  const cur = invoice.currency;
  const sym = invoice.currencySymbol;
  const { subtotal, discount, total } = computeTotals(
    invoice.items,
    invoice.discountType,
    invoice.discountValue,
  );
  const money = (n: number) => formatMoney(n, cur, sym);
  const code = verifyCode ?? t.preview;
  const wmText = profile.watermarkText || profile.name;
  const microUnit = ` ${profile.name} · ${invoice.number} · VERIFIED · ${code} ·`;
  const micro = microUnit.repeat(10);

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
        fontFamily: SANS,
        overflow: "hidden",
        boxSizing: "border-box",
        backgroundImage: watermarkUri(wmText),
        backgroundRepeat: "repeat",
      }}
    >
      {/* Logo besar transparan — penanda kepemilikan producer */}
      {profile.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.logoUrl}
          alt=""
          aria-hidden
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "58%",
            maxWidth: 420,
            objectFit: "contain",
            transform: "translate(-50%, -50%)",
            opacity: 0.05,
            pointerEvents: "none",
          }}
        />
      ) : null}

      {/* HEADER BAND */}
      <div style={{ position: "relative", background: SLATE, color: CREAM, padding: "24px 40px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            {profile.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.logoUrl}
                alt={profile.name}
                crossOrigin="anonymous"
                style={{ width: 46, height: 46, objectFit: "contain", borderRadius: 8, background: "#ffffff1f", padding: 4 }}
              />
            ) : null}
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.2, lineHeight: 1.15 }}>
                {profile.name}
              </div>
              <div style={{ fontSize: 10.5, color: BRONZE, fontWeight: 700, letterSpacing: 1, marginTop: 3, textTransform: "uppercase" }}>
                {profile.tagline || t.defaultTagline}
              </div>
              {profile.address ? (
                <div style={{ fontSize: 11, color: CREAM, opacity: 0.8, whiteSpace: "pre-line", marginTop: 6, lineHeight: 1.4 }}>
                  {profile.address}
                </div>
              ) : null}
              {profile.contact ? (
                <div style={{ fontSize: 11, color: CREAM, opacity: 0.8, marginTop: 2 }}>
                  {profile.contact}
                </div>
              ) : null}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 6, color: BRONZE }}>{t.invoice}</div>
            <div style={{ fontFamily: MONO, fontSize: 13, marginTop: 5, color: CREAM }}>{invoice.number}</div>
          </div>
        </div>
      </div>
      <div style={{ height: 4, background: BRONZE }} />

      {/* BODY */}
      <div style={{ position: "relative", padding: "26px 40px 34px" }}>
        {/* Tagihan kepada + tanggal */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
          <div>
            <div style={labelStyle}>{t.billTo}</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 5 }}>{invoice.clientName}</div>
            {invoice.clientContact ? (
              <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{invoice.clientContact}</div>
            ) : null}
          </div>
          <div style={{ textAlign: "right", fontSize: 12 }}>
            <div style={{ marginBottom: 5 }}>
              <span style={{ color: MUTED }}>{t.date}</span>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{fmtDate(invoice.date, t.locale)}</div>
            </div>
            {invoice.dueDate ? (
              <div>
                <span style={{ color: MUTED }}>{t.due}</span>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{fmtDate(invoice.dueDate, t.locale)}</div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Item */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20, fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: SLATE, color: CREAM }}>
              <th style={th("left", 34)}>#</th>
              <th style={th("left")}>{t.desc}</th>
              <th style={th("right", 52)}>{t.qty}</th>
              <th style={th("right", 128)}>{t.price}</th>
              <th style={th("right", 138)}>{t.amount}</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${LINE}`, background: i % 2 ? ZEBRA : "transparent" }}>
                <td style={td("left", MUTED)}>{i + 1}</td>
                <td style={td("left")}>{it.desc}</td>
                <td style={td("right")}>{it.qty}</td>
                <td style={td("right")}>{money(it.price)}</td>
                <td style={{ ...td("right"), fontWeight: 700 }}>{money(lineTotal(it))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <div style={{ width: 290, fontSize: 13 }}>
            <Row label={t.subtotal} value={money(subtotal)} muted />
            {discount > 0 ? (
              <Row
                label={invoice.discountType === "percent" ? `${t.discount} (${invoice.discountValue}%)` : t.discount}
                value={`- ${money(discount)}`}
                color={BRED}
              />
            ) : null}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
                padding: "11px 16px",
                background: BORD,
                color: CREAM,
                borderRadius: 8,
              }}
            >
              <span style={{ fontWeight: 700, letterSpacing: 1 }}>{t.total}</span>
              <span style={{ color: BRONZE, fontWeight: 800, fontSize: 18 }}>{money(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", marginTop: 26, display: "flex", justifyContent: "space-between", gap: 24, minHeight: 120 }}>
          <div style={{ flex: 1, maxWidth: 360 }}>
            {invoice.notes ? (
              <div style={{ marginBottom: 12 }}>
                <div style={labelStyle}>{t.notes}</div>
                <div style={{ fontSize: 12, whiteSpace: "pre-line", marginTop: 3 }}>{invoice.notes}</div>
              </div>
            ) : null}
            {profile.bankInfo ? (
              <div>
                <div style={labelStyle}>{t.payment}</div>
                <div style={{ fontSize: 12, whiteSpace: "pre-line", marginTop: 3 }}>{profile.bankInfo}</div>
              </div>
            ) : null}
          </div>

          {/* Stempel */}
          <div style={{ position: "absolute", left: "40%", top: 6 }}>
            <InvoiceStamp status={invoice.status} language={lang} />
          </div>

          {/* QRIS */}
          {profile.qrisUrl ? (
            <div style={{ width: 152, border: `1px solid ${LINE}`, borderRadius: 10, padding: 9, textAlign: "center", background: "#ffffff" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.qrisUrl}
                alt="QRIS"
                crossOrigin="anonymous"
                style={{ width: "100%", height: 134, objectFit: "contain", imageRendering: "crisp-edges" }}
              />
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: BRED, marginTop: 5 }}>QRIS</div>
              <div style={{ fontSize: 9, color: MUTED }}>{t.scan}</div>
              <div style={{ fontSize: 9, color: INK, fontWeight: 600, marginTop: 2 }}>{profile.name}</div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Microtext + kode verifikasi */}
      <div style={{ borderTop: `1px solid ${LINE}` }}>
        <div
          style={{
            fontSize: 5,
            lineHeight: 1,
            color: "#c3b594",
            whiteSpace: "nowrap",
            overflow: "hidden",
            padding: "3px 0",
            fontFamily: MONO,
            letterSpacing: 0.5,
          }}
        >
          {micro}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 40px 16px",
            fontSize: 10,
            color: MUTED,
          }}
        >
          <span>
            {t.verify}:{" "}
            <span style={{ fontFamily: MONO, fontWeight: 700, color: INK, letterSpacing: 1 }}>{code}</span>
          </span>
          <span style={{ letterSpacing: 0.3 }}>{profile.name} · {t.sealed}</span>
        </div>
      </div>
    </div>
  );
});

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: MUTED,
  textTransform: "uppercase",
  letterSpacing: 1.5,
  fontWeight: 700,
};

function th(align: "left" | "right", width?: number): React.CSSProperties {
  return {
    textAlign: align,
    padding: "9px 10px",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    width,
  };
}
function td(align: "left" | "right", color?: string): React.CSSProperties {
  return { textAlign: align, padding: "8px 10px", verticalAlign: "top", color };
}

function Row({ label, value, muted, color }: { label: string; value: string; muted?: boolean; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 2px" }}>
      <span style={{ color: muted ? MUTED : color ?? INK }}>{label}</span>
      <span style={{ fontWeight: 600, color: color ?? INK }}>{value}</span>
    </div>
  );
}
