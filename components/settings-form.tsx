"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Upload, X, ImageIcon, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { settingsSchema, type SettingsFormValues } from "@/lib/validations";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

type UploadField = "logoUrl" | "qrisUrl";

export function SettingsForm({ defaultValues }: { defaultValues: SettingsFormValues }) {
  const router = useRouter();
  const logoRef = React.useRef<HTMLInputElement>(null);
  const qrisRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState<UploadField | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });

  const logoUrl = watch("logoUrl");
  const qrisUrl = watch("qrisUrl");

  function makeUploader(field: UploadField, label: string) {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(field);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      setUploading(null);
      e.target.value = "";
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error ?? "Upload gagal.");
        return;
      }
      const { url } = await res.json();
      setValue(field, url, { shouldDirty: true });
      toast.success(`${label} diunggah.`);
    };
  }

  async function onSubmit(data: SettingsFormValues) {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("Gagal menyimpan.");
      return;
    }
    toast.success("Profil studio disimpan.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      {/* Logo & QRIS */}
      <section className="grid gap-5 rounded-xl border bg-card p-5 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold">Logo Studio</h2>
          <div className="flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="size-full object-contain" />
              ) : (
                <ImageIcon className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <input
                ref={logoRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={makeUploader("logoUrl", "Logo")}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoRef.current?.click()}
                  disabled={uploading !== null}
                >
                  {uploading === "logoUrl" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  Unggah
                </Button>
                {logoUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setValue("logoUrl", "", { shouldDirty: true })}>
                    <X className="size-4" />
                    Hapus
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">PNG/JPG/WEBP/SVG. Maks 2MB.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">QRIS Pembayaran</h2>
          <div className="flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
              {qrisUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrisUrl} alt="QRIS" className="size-full object-contain" />
              ) : (
                <QrCode className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <input
                ref={qrisRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={makeUploader("qrisUrl", "QRIS")}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => qrisRef.current?.click()}
                  disabled={uploading !== null}
                >
                  {uploading === "qrisUrl" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  Unggah
                </Button>
                {qrisUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setValue("qrisUrl", "", { shouldDirty: true })}>
                    <X className="size-4" />
                    Hapus
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Gambar QRIS statis dari bank/e-wallet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Profil */}
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold">Profil Studio</h2>
        <div>
          <Label htmlFor="name">Nama Studio</Label>
          <Input id="name" {...register("name")} className="mt-1.5" />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="tagline">Tagline / Motto</Label>
          <Input
            id="tagline"
            placeholder="mis. Beats & Mixing Sejak 2018"
            {...register("tagline")}
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-muted-foreground">Tampil kecil di bawah nama studio pada invoice.</p>
        </div>
        <div>
          <Label htmlFor="address">Alamat</Label>
          <Textarea id="address" rows={2} {...register("address")} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="contact">Kontak</Label>
          <Input id="contact" placeholder="email / telepon / website" {...register("contact")} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="bankInfo">Info Rekening / Pembayaran</Label>
          <Textarea id="bankInfo" rows={3} placeholder="Bank — No. Rekening — a.n. Nama" {...register("bankInfo")} className="mt-1.5" />
        </div>
      </section>

      {/* Pengaturan Invoice */}
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold">Pengaturan Invoice</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="invoicePrefix">Prefix Nomor</Label>
            <Input
              id="invoicePrefix"
              placeholder="INV"
              {...register("invoicePrefix")}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Contoh: <span className="font-mono">INV-2026-0001</span>. Hanya huruf/angka.
            </p>
            <FieldError message={errors.invoicePrefix?.message} />
          </div>
          <div>
            <Label>Bahasa Invoice</Label>
            <Controller
              control={control}
              name="language"
              render={({ field }) => (
                <Select value={field.value ?? "id"} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Indonesia</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <p className="mt-1 text-xs text-muted-foreground">Label di preview & export.</p>
          </div>
        </div>
        <div>
          <Label htmlFor="watermarkText">Teks Watermark</Label>
          <Input
            id="watermarkText"
            placeholder="(kosong = pakai nama studio)"
            {...register("watermarkText")}
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-muted-foreground">Teks tipis berulang di latar invoice sebagai tanda kepemilikan.</p>
        </div>
      </section>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Simpan
      </Button>
    </form>
  );
}
