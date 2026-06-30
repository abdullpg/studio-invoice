import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInvoice, getProfileOrCreate, toDateInput } from "@/lib/data";
import { InvoiceForm } from "@/components/invoice-form";
import type { InvoiceFormValues } from "@/lib/validations";

export const metadata: Metadata = {
  title: "Edit Invoice — Studio Invoice",
};

export default async function EditInvoicePage({
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

  const defaultValues: InvoiceFormValues = {
    date: toDateInput(invoice.date),
    dueDate: toDateInput(invoice.dueDate),
    clientName: invoice.clientName,
    clientContact: invoice.clientContact ?? "",
    currency: invoice.currency as InvoiceFormValues["currency"],
    currencySymbol: invoice.currencySymbol ?? "",
    discountType: invoice.discountType as InvoiceFormValues["discountType"],
    discountValue: invoice.discountValue,
    status: invoice.status as InvoiceFormValues["status"],
    notes: invoice.notes ?? "",
    items: invoice.items.map((it) => ({
      desc: it.desc,
      qty: it.qty,
      price: it.price,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Invoice</h1>
        <p className="text-sm text-muted-foreground">{invoice.number}</p>
      </div>
      <InvoiceForm
        mode="edit"
        number={invoice.number}
        invoiceId={invoice.id}
        profile={profile}
        defaultValues={defaultValues}
      />
    </div>
  );
}
