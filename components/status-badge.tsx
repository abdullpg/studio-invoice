import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const paid = status === "paid";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        paid
          ? "bg-success/15 text-success"
          : "bg-destructive/15 text-destructive",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          paid ? "bg-success" : "bg-destructive",
        )}
      />
      {paid ? "Lunas" : "Belum Lunas"}
    </span>
  );
}
