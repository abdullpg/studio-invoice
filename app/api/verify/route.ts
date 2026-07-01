import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeTotals } from "@/lib/totals";
import { isValidVerifyCode } from "@/lib/verify";

/**
 * Endpoint publik (tanpa login) untuk memverifikasi keaslian invoice.
 * Mengembalikan detail HANYA jika nomor + kode cocok — mencegah enumerasi
 * data karena kode tak bisa ditebak tanpa AUTH_SECRET.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const number = (searchParams.get("number") ?? "").trim();
  const code = (searchParams.get("code") ?? "").trim();

  if (!number || !code) {
    return NextResponse.json({ valid: false });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { number },
    include: { items: true },
  });
  if (!invoice) {
    return NextResponse.json({ valid: false });
  }

  const { total } = computeTotals(invoice.items, invoice.discountType, invoice.discountValue);
  const valid = isValidVerifyCode(
    { number: invoice.number, date: invoice.date, clientName: invoice.clientName, total },
    code,
  );

  if (!valid) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    invoice: {
      number: invoice.number,
      clientName: invoice.clientName,
      date: invoice.date,
      status: invoice.status,
      total,
      currency: invoice.currency,
      currencySymbol: invoice.currencySymbol,
    },
  });
}
