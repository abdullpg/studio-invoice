import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { peekInvoiceNumber } from "@/lib/invoice-number";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const number = await peekInvoiceNumber();
  return NextResponse.json({ number });
}
