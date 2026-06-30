import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!invoice) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

  // Nomor invoice tidak diubah saat edit. Item di-replace seluruhnya.
  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
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
        deleteMany: {},
        create: data.items.map((it) => ({
          desc: it.desc,
          qty: it.qty,
          price: it.price,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(invoice);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
