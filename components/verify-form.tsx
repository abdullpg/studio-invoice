"use client";

import * as React from "react";
import { ShieldCheck, ShieldX, Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/currency";

type Result =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "invalid" }
  | {
      state: "valid";
      invoice: {
        number: string;
        clientName: string;
        date: string;
        status: string;
        total: number;
        currency: string;
        currencySymbol: string | null;
      };
    };

export function VerifyForm({
  initialNumber,
  initialCode,
}: {
  initialNumber: string;
  initialCode: string;
}) {
  const [number, setNumber] = React.useState(initialNumber);
  const [code, setCode] = React.useState(initialCode);
  const [result, setResult] = React.useState<Result>({ state: "idle" });

  const verify = React.useCallback(async (num: string, cd: string) => {
    if (!num.trim() || !cd.trim()) return;
    setResult({ state: "loading" });
    const params = new URLSearchParams({ number: num.trim(), code: cd.trim() });
    try {
      const res = await fetch(`/api/verify?${params}`);
      const json = await res.json();
      if (json.valid) setResult({ state: "valid", invoice: json.invoice });
      else setResult({ state: "invalid" });
    } catch {
      setResult({ state: "invalid" });
    }
  }, []);

  // Auto-verifikasi bila datang dari tautan/QR ber-parameter.
  React.useEffect(() => {
    if (initialNumber && initialCode) verify(initialNumber, initialCode);
  }, [initialNumber, initialCode, verify]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Receipt className="size-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Verifikasi Invoice</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masukkan nomor invoice dan kode verifikasi untuk memastikan keasliannya.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify(number, code);
          }}
          className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="number">Nomor Invoice</Label>
            <Input
              id="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="INV-2026-0001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Kode Verifikasi</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="XXXX-XXXX-XXXX"
              className="font-mono uppercase"
            />
          </div>
          <Button type="submit" className="w-full" disabled={result.state === "loading"}>
            {result.state === "loading" && <Loader2 className="size-4 animate-spin" />}
            Verifikasi
          </Button>
        </form>

        {result.state === "valid" && (
          <div className="mt-4 rounded-xl border border-success/30 bg-success/10 p-5">
            <div className="mb-3 flex items-center gap-2 text-success">
              <ShieldCheck className="size-5" />
              <span className="font-semibold">Invoice Asli & Terverifikasi</span>
            </div>
            <dl className="space-y-1.5 text-sm">
              <Row label="Nomor" value={result.invoice.number} mono />
              <Row label="Klien" value={result.invoice.clientName} />
              <Row
                label="Tanggal"
                value={new Date(result.invoice.date).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
              <Row
                label="Total"
                value={formatMoney(
                  result.invoice.total,
                  result.invoice.currency,
                  result.invoice.currencySymbol,
                )}
              />
              <Row
                label="Status"
                value={result.invoice.status === "paid" ? "Lunas" : "Belum Lunas"}
              />
            </dl>
          </div>
        )}

        {result.state === "invalid" && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-destructive">
            <ShieldX className="size-5 shrink-0" />
            <div>
              <p className="font-semibold">Tidak Terverifikasi</p>
              <p className="text-sm opacity-90">
                Nomor atau kode tidak cocok. Invoice ini tidak dapat dipastikan
                keasliannya.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono font-medium" : "font-medium"}>{value}</dd>
    </div>
  );
}
