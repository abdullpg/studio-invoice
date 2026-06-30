"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { settingsSchema, type SettingsFormValues } from "@/lib/validations";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export function SettingsForm({ defaultValues }: { defaultValues: SettingsFormValues }) {
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });

  const logoUrl = watch("logoUrl");

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Upload gagal.");
      return;
    }
    const { url } = await res.json();
    setValue("logoUrl", url, { shouldDirty: true });
    toast.success("Logo diunggah.");
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
      <section className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Logo</h2>
        <div className="flex items-center gap-4">
          <div className="flex size-20 items-center justify-center overflow-hidden rounded-xl border bg-muted">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="size-full object-contain" />
            ) : (
              <ImageIcon className="size-6 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={onUpload}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                Unggah Logo
              </Button>
              {logoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue("logoUrl", "", { shouldDirty: true })}
                >
                  <X className="size-4" />
                  Hapus
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP, atau SVG. Maks 2MB.</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold">Profil Studio</h2>
        <div>
          <Label htmlFor="name">Nama Studio</Label>
          <Input id="name" {...register("name")} className="mt-1.5" />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="address">Alamat</Label>
          <Textarea id="address" rows={2} {...register("address")} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="contact">Kontak</Label>
          <Input
            id="contact"
            placeholder="email / telepon / website"
            {...register("contact")}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="bankInfo">Info Rekening / Pembayaran</Label>
          <Textarea
            id="bankInfo"
            rows={3}
            placeholder="Bank — No. Rekening — a.n. Nama"
            {...register("bankInfo")}
            className="mt-1.5"
          />
        </div>
      </section>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Simpan
      </Button>
    </form>
  );
}
