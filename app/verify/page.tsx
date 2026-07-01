import type { Metadata } from "next";
import { VerifyForm } from "@/components/verify-form";

export const metadata: Metadata = {
  title: "Verifikasi Invoice — Studio Invoice",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ number?: string; code?: string }>;
}) {
  const sp = await searchParams;
  return <VerifyForm initialNumber={sp.number ?? ""} initialCode={sp.code ?? ""} />;
}
