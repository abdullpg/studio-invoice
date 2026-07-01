import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bulkSchema = z.object({
  action: z.enum(["delete", "paid", "unpaid"]),
  ids: z.array(z.string().min(1)).min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 400 });
  }
  const { action, ids } = parsed.data;

  if (action === "delete") {
    await prisma.invoice.deleteMany({ where: { id: { in: ids } } });
  } else {
    await prisma.invoice.updateMany({
      where: { id: { in: ids } },
      data: { status: action },
    });
  }

  return NextResponse.json({ ok: true, count: ids.length });
}
