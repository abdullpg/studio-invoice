import { prisma } from "./prisma";

async function getPrefix(): Promise<string> {
  const profile = await prisma.studioProfile.findFirst();
  const raw = (profile?.invoicePrefix || "INV").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return raw || "INV";
}

function format(prefix: string, year: number, count: number): string {
  return `${prefix}-${year}-${String(count).padStart(4, "0")}`;
}

/**
 * Mengkonsumsi satu nomor secara transaksional. Reset count ke 1 saat tahun
 * berganti. Dipanggil hanya saat invoice benar-benar dibuat (POST).
 */
export async function consumeInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = await getPrefix();
  const count = await prisma.$transaction(async (tx) => {
    const seq = await tx.invoiceSequence.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton", year, count: 0 },
    });
    const nextCount = seq.year === year ? seq.count + 1 : 1;
    await tx.invoiceSequence.update({
      where: { id: "singleton" },
      data: { year, count: nextCount },
    });
    return nextCount;
  });
  return format(prefix, year, count);
}

/**
 * Mengintip nomor berikutnya tanpa mengkonsumsi — untuk preview di form.
 */
export async function peekInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = await getPrefix();
  const seq = await prisma.invoiceSequence.findUnique({
    where: { id: "singleton" },
  });
  const nextCount = !seq || seq.year !== year ? 1 : seq.count + 1;
  return format(prefix, year, nextCount);
}
