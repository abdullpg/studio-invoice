import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceHistoryTable } from "@/components/invoice-history-table";

export const metadata: Metadata = {
  title: "Invoice — Studio Invoice",
};

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoice</h1>
          <p className="text-sm text-muted-foreground">
            Riwayat seluruh invoice studio kamu.
          </p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Buat Invoice</span>
          </Link>
        </Button>
      </div>
      <InvoiceHistoryTable />
    </div>
  );
}
