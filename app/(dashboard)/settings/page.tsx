import type { Metadata } from "next";
import { getProfileOrCreate } from "@/lib/data";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = {
  title: "Pengaturan — Studio Invoice",
};

export default async function SettingsPage() {
  const profile = await getProfileOrCreate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">
          Profil studio ini tampil di setiap invoice.
        </p>
      </div>
      <SettingsForm
        defaultValues={{
          name: profile.name,
          tagline: profile.tagline ?? "",
          address: profile.address ?? "",
          contact: profile.contact ?? "",
          bankInfo: profile.bankInfo ?? "",
          logoUrl: profile.logoUrl ?? "",
          qrisUrl: profile.qrisUrl ?? "",
          watermarkText: profile.watermarkText ?? "",
          invoicePrefix: profile.invoicePrefix ?? "INV",
          language: (profile.language as "id" | "en") ?? "id",
        }}
      />
    </div>
  );
}
