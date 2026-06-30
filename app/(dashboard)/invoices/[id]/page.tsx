import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInvoice, getProfileOrCreate } from "@/lib/data";
import { InvoiceDetail } from "@/components/invoice-detail";

export const metadata: Metadata = {
  title: "Detail Invoice — Studio Invoice",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, profile] = await Promise.all([
    getInvoice(id),
    getProfileOrCreate(),
  ]);
  if (!invoice) notFound();

  return (
    <InvoiceDetail
      id={invoice.id}
      number={invoice.number}
      profile={profile}
      invoice={{
        number: invoice.number,
        date: invoice.date,
        dueDate: invoice.dueDate,
        clientName: invoice.clientName,
        clientContact: invoice.clientContact,
        currency: invoice.currency,
        currencySymbol: invoice.currencySymbol,
        discountType: invoice.discountType,
        discountValue: invoice.discountValue,
        status: invoice.status,
        notes: invoice.notes,
        items: invoice.items.map((it) => ({
          desc: it.desc,
          qty: it.qty,
          price: it.price,
        })),
      }}
    />
  );
}
