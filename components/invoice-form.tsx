"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  invoiceSchema,
  type InvoiceFormInput,
  type InvoiceFormValues,
} from "@/lib/validations";
import { CURRENCY_OPTIONS } from "@/lib/currency";
import { InvoicePreview, type PreviewProfile } from "@/components/invoice-preview";

type Props = {
  mode: "create" | "edit";
  number: string;
  invoiceId?: string;
  profile: PreviewProfile;
  defaultValues: InvoiceFormValues;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export function InvoiceForm({ mode, number, invoiceId, profile, defaultValues }: Props) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormInput, unknown, InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const values = watch();

  async function onSubmit(data: InvoiceFormValues) {
    const payload = {
      ...data,
      discountValue: Number(data.discountValue) || 0,
      items: data.items.map((it) => ({
        desc: it.desc,
        qty: Number(it.qty) || 0,
        price: Number(it.price) || 0,
      })),
    };
    const url = mode === "create" ? "/api/invoices" : `/api/invoices/${invoiceId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      toast.error("Gagal menyimpan invoice. Periksa kembali isian.");
      return;
    }
    const saved = await res.json();
    toast.success(mode === "create" ? "Invoice dibuat." : "Invoice diperbarui.");
    router.push(`/invoices/${saved.id}`);
    router.refresh();
  }

  const currency = values.currency;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
    >
      {/* Kolom form */}
      <div className="space-y-6">
        {/* Klien & tanggal */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Detail Invoice</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="clientName">Nama Klien</Label>
              <Input id="clientName" {...register("clientName")} className="mt-1.5" />
              <FieldError message={errors.clientName?.message} />
            </div>
            <div>
              <Label htmlFor="clientContact">Kontak Klien</Label>
              <Input
                id="clientContact"
                placeholder="email / telepon (opsional)"
                {...register("clientContact")}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="date">Tanggal</Label>
              <Input id="date" type="date" {...register("date")} className="mt-1.5" />
              <FieldError message={errors.date?.message} />
            </div>
            <div>
              <Label htmlFor="dueDate">Jatuh Tempo</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} className="mt-1.5" />
            </div>
          </div>
        </section>

        {/* Item */}
        <section className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Item</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ desc: "", qty: 1, price: 0 })}
            >
              <Plus className="size-4" />
              Tambah
            </Button>
          </div>
          <div className="space-y-3">
            {fields.map((field, i) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_auto] gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_70px_120px_auto] sm:items-start"
              >
                <div className="col-span-2 sm:col-span-1">
                  <Input
                    placeholder="Deskripsi pekerjaan"
                    {...register(`items.${i}.desc`)}
                  />
                  <FieldError message={errors.items?.[i]?.desc?.message} />
                </div>
                <div>
                  <Input
                    type="number"
                    step="any"
                    min={0}
                    placeholder="Qty"
                    {...register(`items.${i}.qty`, { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    step="any"
                    min={0}
                    placeholder="Harga"
                    {...register(`items.${i}.price`, { valueAsNumber: true })}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Hapus item"
                  disabled={fields.length === 1}
                  onClick={() => remove(i)}
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
          {errors.items?.message && (
            <FieldError message={errors.items.message as string} />
          )}
        </section>

        {/* Mata uang & diskon */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Mata Uang & Diskon</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Mata Uang</Label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {currency === "CUSTOM" && (
              <div>
                <Label htmlFor="currencySymbol">Simbol Custom</Label>
                <Input
                  id="currencySymbol"
                  placeholder="mis. ¥, £, RM"
                  {...register("currencySymbol")}
                  className="mt-1.5"
                />
              </div>
            )}
            <div>
              <Label>Jenis Diskon</Label>
              <Controller
                control={control}
                name="discountType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Persen (%)</SelectItem>
                      <SelectItem value="nominal">Nominal</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="discountValue">Nilai Diskon</Label>
              <Input
                id="discountValue"
                type="number"
                step="any"
                min={0}
                {...register("discountValue", { valueAsNumber: true })}
                className="mt-1.5"
              />
            </div>
          </div>
        </section>

        {/* Status & catatan */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Status & Catatan</h2>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <div className="mb-4 flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Status Pembayaran</p>
                  <p className="text-xs text-muted-foreground">
                    {field.value === "paid" ? "Lunas" : "Belum Lunas"}
                  </p>
                </div>
                <Switch
                  checked={field.value === "paid"}
                  onCheckedChange={(c) => field.onChange(c ? "paid" : "unpaid")}
                />
              </div>
            )}
          />
          <div>
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Catatan tambahan (opsional)"
              {...register("notes")}
              className="mt-1.5"
            />
          </div>
        </section>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "create" ? "Simpan Invoice" : "Simpan Perubahan"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Pratinjau
        </p>
        <div className="overflow-hidden rounded-xl border bg-muted/30 p-3 shadow-sm">
          <div className="origin-top scale-[0.92]">
            <InvoicePreview
              profile={profile}
              invoice={{
                number,
                date: values.date,
                dueDate: values.dueDate,
                clientName: values.clientName || "Nama Klien",
                clientContact: values.clientContact,
                currency: values.currency,
                currencySymbol: values.currencySymbol,
                discountType: values.discountType,
                discountValue: Number(values.discountValue) || 0,
                status: values.status,
                notes: values.notes,
                items: (values.items ?? []).map((it) => ({
                  desc: it.desc || "—",
                  qty: Number(it.qty) || 0,
                  price: Number(it.price) || 0,
                })),
              }}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
