import type { Metadata } from "next";
import { getProfileOrCreate, toDateInput } from "@/lib/data";
import { peekInvoiceNumber } from "@/lib/invoice-number";
import { InvoiceForm } from "@/components/invoice-form";
import type { InvoiceFormValues } from "@/lib/validations";

export const metadata: Metadata = {
  title: "Buat Invoice — Studio Invoice",
};

export default async function NewInvoicePage() {
  const [profile, number] = await Promise.all([
    getProfileOrCreate(),
    peekInvoiceNumber(),
  ]);

  const defaultValues: InvoiceFormValues = {
    date: toDateInput(new Date()),
    dueDate: "",
    clientName: "",
    clientContact: "",
    currency: "IDR",
    currencySymbol: "",
    discountType: "percent",
    discountValue: 0,
    status: "unpaid",
    notes: "",
    items: [{ desc: "", qty: 1, price: 0 }],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Buat Invoice</h1>
        <p className="text-sm text-muted-foreground">
          Nomor otomatis: <span className="font-medium text-foreground">{number}</span>
        </p>
      </div>
      <InvoiceForm
        mode="create"
        number={number}
        profile={profile}
        defaultValues={defaultValues}
      />
    </div>
  );
}
