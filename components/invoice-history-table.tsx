"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { computeTotals } from "@/lib/totals";
import { formatMoney } from "@/lib/currency";

type Item = { qty: number; price: number };
type Invoice = {
  id: string;
  number: string;
  date: string;
  clientName: string;
  currency: string;
  currencySymbol: string | null;
  discountType: string;
  discountValue: number;
  status: string;
  items: Item[];
};

const PAGE_SIZE = 10;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function invoiceTotal(inv: Invoice) {
  const { total } = computeTotals(inv.items, inv.discountType, inv.discountValue);
  return formatMoney(total, inv.currency, inv.currencySymbol);
}

export function InvoiceHistoryTable() {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<Invoice[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [busy, setBusy] = React.useState(false);
  const [confirm, setConfirm] = React.useState<{ open: boolean; ids: string[] }>({
    open: false,
    ids: [],
  });
  const [refreshKey, setRefreshKey] = React.useState(0);

  const [debouncedQ, setDebouncedQ] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({
      q: debouncedQ,
      status,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    fetch(`/api/invoices?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        setData(json.invoices ?? []);
        setTotal(json.total ?? 0);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debouncedQ, status, page, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageIds = data.map((d) => d.id);
  const allChecked = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someChecked = pageIds.some((id) => selected.has(id));

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function runBulk(action: "delete" | "paid" | "unpaid", ids: string[]) {
    if (ids.length === 0) return;
    setBusy(true);
    const res = await fetch("/api/invoices/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ids }),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error("Aksi gagal.");
      return;
    }
    if (action === "delete") {
      toast.success(`${ids.length} invoice dihapus.`);
      clearSelection();
    } else {
      toast.success(action === "paid" ? "Ditandai Lunas." : "Ditandai Belum Lunas.");
    }
    setRefreshKey((k) => k + 1);
    router.refresh();
  }

  const selectedIds = React.useMemo(() => Array.from(selected), [selected]);

  function RowActions({ inv }: { inv: Invoice }) {
    const paid = inv.status === "paid";
    return (
      <div className="flex items-center justify-end gap-0.5">
        <Button variant="ghost" size="icon" className="size-8" title="Lihat" asChild>
          <Link href={`/invoices/${inv.id}`}>
            <Eye className="size-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className="size-8" title="Edit" asChild>
          <Link href={`/invoices/${inv.id}/edit`}>
            <Pencil className="size-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          title={paid ? "Tandai Belum Lunas" : "Tandai Lunas"}
          onClick={() => runBulk(paid ? "unpaid" : "paid", [inv.id])}
          disabled={busy}
        >
          {paid ? (
            <Circle className="size-4 text-muted-foreground" />
          ) : (
            <CheckCircle2 className="size-4 text-success" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          title="Hapus"
          onClick={() => setConfirm({ open: true, ids: [inv.id] })}
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    );
  }

  const empty = !loading && data.length === 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nomor atau nama klien…"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="paid">Lunas</SelectItem>
            <SelectItem value="unpaid">Belum Lunas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-accent/40 px-3 py-2">
          <span className="text-sm font-medium">{selected.size} dipilih</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={() => runBulk("paid", selectedIds)}>
              <CheckCircle2 className="size-4" />
              Tandai Lunas
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => runBulk("unpaid", selectedIds)}>
              <Circle className="size-4" />
              Belum Lunas
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirm({ open: true, ids: selectedIds })}
            >
              <Trash2 className="size-4" />
              Hapus
            </Button>
            <Button size="sm" variant="ghost" onClick={clearSelection}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allChecked ? true : someChecked ? "indeterminate" : false}
                  onCheckedChange={toggleAll}
                  aria-label="Pilih semua"
                />
              </TableHead>
              <TableHead>Nomor</TableHead>
              <TableHead>Klien</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : empty ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-32 text-center">
                  <FileText className="mx-auto mb-2 size-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Belum ada invoice.</p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((inv) => (
                <TableRow key={inv.id} data-state={selected.has(inv.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(inv.id)}
                      onCheckedChange={() => toggleRow(inv.id)}
                      aria-label={`Pilih ${inv.number}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/invoices/${inv.id}`} className="hover:underline">
                      {inv.number}
                    </Link>
                  </TableCell>
                  <TableCell>{inv.clientName}</TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(inv.date)}</TableCell>
                  <TableCell className="text-right tabular-nums">{invoiceTotal(inv)}</TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell>
                    <RowActions inv={inv} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {loading ? (
          <div className="flex h-28 items-center justify-center rounded-xl border bg-card">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : empty ? (
          <div className="flex h-28 flex-col items-center justify-center rounded-xl border bg-card">
            <FileText className="mb-2 size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Belum ada invoice.</p>
          </div>
        ) : (
          <>
            <label className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
              <Checkbox
                checked={allChecked ? true : someChecked ? "indeterminate" : false}
                onCheckedChange={toggleAll}
              />
              Pilih semua di halaman ini
            </label>
            {data.map((inv) => (
              <div key={inv.id} className="rounded-xl border bg-card p-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    className="mt-1"
                    checked={selected.has(inv.id)}
                    onCheckedChange={() => toggleRow(inv.id)}
                    aria-label={`Pilih ${inv.number}`}
                  />
                  <Link href={`/invoices/${inv.id}`} className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{inv.number}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="mt-0.5 truncate text-sm">{inv.clientName}</div>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{fmtDate(inv.date)}</span>
                      <span className="font-medium tabular-nums text-foreground">{invoiceTotal(inv)}</span>
                    </div>
                  </Link>
                </div>
                <div className="mt-2 border-t pt-2">
                  <RowActions inv={inv} />
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer / pagination */}
      {!empty && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {total} invoice · hal. {page}/{totalPages}
          </p>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Konfirmasi hapus */}
      <Dialog open={confirm.open} onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Hapus {confirm.ids.length} invoice?
            </DialogTitle>
            <DialogDescription>Tindakan ini permanen dan tidak bisa dibatalkan.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm({ open: false, ids: [] })}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                const ids = confirm.ids;
                setConfirm({ open: false, ids: [] });
                await runBulk("delete", ids);
              }}
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
