"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FileText, PlusCircle, Settings, LogOut, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/invoices", label: "Invoice", icon: FileText },
  { href: "/invoices/new", label: "Buat Baru", icon: PlusCircle },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

/**
 * Tentukan SATU item aktif via longest-match: item yang href-nya paling panjang
 * dan cocok dengan pathname menang. Ini mencegah "/invoices" ikut aktif saat
 * berada di "/invoices/new".
 */
function getActiveHref(pathname: string): string {
  const matches = NAV.filter(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );
  if (matches.length === 0) return "";
  return matches.reduce((best, item) =>
    item.href.length > best.href.length ? item : best,
  ).href;
}

export function AppShell({
  user,
  children,
}: {
  user: { email?: string | null; name?: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname);

  return (
    <div className="min-h-dvh">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Receipt className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Studio Invoice</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map((item) => {
            const active = activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="size-4" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Header — mobile */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Receipt className="size-3.5" />
          </div>
          <span className="text-sm font-semibold">Studio Invoice</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Keluar"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* Konten utama */}
      <main className="overflow-x-clip px-4 pb-24 pt-6 md:ml-60 md:px-10 md:pb-10 md:pt-8">
        <div className="mx-auto w-full min-w-0 max-w-5xl">{children}</div>
      </main>

      {/* Bottom nav — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.map((item) => {
          const active = activeHref === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
