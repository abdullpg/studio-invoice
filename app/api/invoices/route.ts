import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validations";
import { consumeInvoiceNumber } from "@/lib/invoice-number";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const status = searchParams.get("status") ?? "all";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));

  const where: Prisma.InvoiceWhereInput = {};
  if (q) {
    where.OR = [
      { number: { contains: q } },
      { clientName: { contains: q } },
    ];
  }
  if (status === "paid" || status === "unpaid") {
    where.status = status;
  }

  const [total, invoices] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { items: true },
    }),
  ]);

  return NextResponse.json({ invoices, total, page, pageSize });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Nomor di-generate server-side (transactional), abaikan input klien.
  const number = await consumeInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      number,
      date: new Date(data.date),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      clientName: data.clientName,
      clientContact: data.clientContact || null,
      currency: data.currency,
      currencySymbol: data.currency === "CUSTOM" ? data.currencySymbol || null : null,
      discountType: data.discountType,
      discountValue: data.discountValue,
      status: data.status,
      notes: data.notes || null,
      items: {
        create: data.items.map((it) => ({
          desc: it.desc,
          qty: it.qty,
          price: it.price,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(invoice, { status: 201 });
}
