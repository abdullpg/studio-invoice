"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  FileImage,
  FileText,
  Trash2,
  Loader2,
  CheckCircle2,
  Circle,
  Maximize2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InvoicePreview,
  type PreviewInvoice,
  type PreviewProfile,
} from "@/components/invoice-preview";
import { FitToWidth } from "@/components/fit-to-width";
import { exportToJPG, exportToPDF } from "@/lib/export";
import { toDateInput } from "@/lib/dates";

type Props = {
  id: string;
  number: string;
  verifyCode: string;
  invoice: PreviewInvoice;
  profile: PreviewProfile;
};

export function InvoiceDetail({ id, number, verifyCode, invoice, profile }: Props) {
  const router = useRouter();
  const previewRef = React.useRef<HTMLDivElement>(null);
  const [busy, setBusy] = React.useState<null | "jpg" | "pdf" | "status" | "delete">(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);

  // Tutup layar penuh dengan tombol Esc.
  React.useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  async function handleExport(kind: "jpg" | "pdf") {
    if (!previewRef.current) return;
    setBusy(kind);
    try {
      if (kind === "jpg") await exportToJPG(previewRef.current, number);
      else await exportToPDF(previewRef.current, number);
    } catch {
      toast.error("Export gagal.");
    } finally {
      setBusy(null);
    }
  }

  async function toggleStatus() {
    setBusy("status");
    const next = invoice.status === "paid" ? "unpaid" : "paid";
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: toDateInput(invoice.date),
        dueDate: invoice.dueDate ? toDateInput(invoice.dueDate) : "",
        clientName: invoice.clientName,
        clientContact: invoice.clientContact ?? "",
        currency: invoice.currency,
        currencySymbol: invoice.currencySymbol ?? "",
        discountType: invoice.discountType,
        discountValue: invoice.discountValue,
        status: next,
        notes: invoice.notes ?? "",
        items: invoice.items,
      }),
    });
    setBusy(null);
    if (!res.ok) {
      toast.error("Gagal mengubah status.");
      return;
    }
    toast.success(next === "paid" ? "Ditandai Lunas." : "Ditandai Belum Lunas.");
    router.refresh();
  }

  async function handleDelete() {
    setBusy("delete");
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setBusy(null);
      toast.error("Gagal menghapus.");
      return;
    }
    toast.success("Invoice dihapus.");
    router.push("/invoices");
    router.refresh();
  }

  const paid = invoice.status === "paid";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/invoices">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleStatus} disabled={busy !== null}>
            {busy === "status" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : paid ? (
              <Circle className="size-4" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {paid ? "Tandai Belum Lunas" : "Tandai Lunas"}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/invoices/${id}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFullscreen(true)}
          >
            <Maximize2 className="size-4" />
            Layar Penuh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("jpg")}
            disabled={busy !== null}
          >
            {busy === "jpg" ? <Loader2 className="size-4 animate-spin" /> : <FileImage className="size-4" />}
            JPG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
            disabled={busy !== null}
          >
            {busy === "pdf" ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
            PDF
          </Button>
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="size-4" />
                Hapus
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hapus invoice {number}?</DialogTitle>
                <DialogDescription>
                  Tindakan ini permanen dan tidak bisa dibatalkan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={busy === "delete"}
                >
                  {busy === "delete" && <Loader2 className="size-4 animate-spin" />}
                  Hapus
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div
        onClick={() => setFullscreen(true)}
        title="Klik untuk layar penuh"
        className="cursor-zoom-in rounded-xl border bg-muted/30 p-3 shadow-sm sm:p-6"
      >
        <FitToWidth baseWidth={760} center>
          <InvoicePreview ref={previewRef} invoice={invoice} profile={profile} verifyCode={verifyCode} />
        </FitToWidth>
      </div>

      {/* Overlay layar penuh */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm"
          onClick={() => setFullscreen(false)}
        >
          <div className="flex items-center justify-between gap-2 p-3 text-white">
            <span className="text-sm font-medium">{number}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExport("jpg");
                }}
                disabled={busy !== null}
              >
                {busy === "jpg" ? <Loader2 className="size-4 animate-spin" /> : <FileImage className="size-4" />}
                JPG
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExport("pdf");
                }}
                disabled={busy !== null}
              >
                {busy === "pdf" ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
                PDF
              </Button>
              <Button
                variant="secondary"
                size="icon"
                aria-label="Tutup"
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreen(false);
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-8">
            <div
              className="mx-auto w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <FitToWidth baseWidth={760} center>
                <InvoicePreview invoice={invoice} profile={profile} verifyCode={verifyCode} />
              </FitToWidth>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
