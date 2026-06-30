import { z } from "zod";

export const itemSchema = z.object({
  desc: z.string().min(1, "Deskripsi wajib diisi"),
  qty: z.coerce.number().min(0, "Qty tidak boleh negatif"),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
});

export const invoiceSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  dueDate: z.string().optional().nullable(),
  clientName: z.string().min(1, "Nama klien wajib diisi"),
  clientContact: z.string().optional().nullable(),
  currency: z.enum(["IDR", "USD", "EUR", "CUSTOM"]),
  currencySymbol: z.string().optional().nullable(),
  discountType: z.enum(["percent", "nominal"]),
  discountValue: z.coerce.number().min(0).default(0),
  status: z.enum(["paid", "unpaid"]),
  notes: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1, "Minimal 1 item"),
});

export type InvoiceFormInput = z.input<typeof invoiceSchema>;
export type InvoiceFormValues = z.output<typeof invoiceSchema>;

export const settingsSchema = z.object({
  name: z.string().min(1, "Nama studio wajib diisi"),
  address: z.string().optional().nullable(),
  contact: z.string().optional().nullable(),
  bankInfo: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
