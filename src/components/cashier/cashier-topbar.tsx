"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, PackageX, ScrollText, Wallet } from "lucide-react";

import { StockSheet } from "@/components/cashier/stock-sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/pos", label: "Order Board", icon: LayoutGrid },
  { href: "/pos/completed", label: "Riwayat Selesai", icon: ScrollText },
  { href: "/pos/shift", label: "Catatan Shift", icon: Wallet },
];

/**
 * Top bar kasir (CASHIER_UI.md): satu papan kerja, tablet-first.
 * Berisi navigasi board/riwayat/shift + toggle Stok Habis Hari Ini.
 * Bukan layout POS kasir tradisional.
 */
export function CashierTopbar() {
  const pathname = usePathname();
  const [stockOpen, setStockOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-surface/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight text-primary">
            Majamu
          </span>
          <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary sm:inline">
            Kasir
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/pos"
                ? pathname === "/pos"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-btn px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-black/60 hover:bg-primary/10"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setStockOpen(true)}
            className="flex items-center gap-2 rounded-btn border border-black/15 px-3 py-2 text-sm font-semibold text-black/70 hover:border-primary/40"
          >
            <PackageX className="h-4 w-4" />
            <span className="hidden md:inline">Stok Habis</span>
          </button>
        </nav>
      </div>

      <StockSheet open={stockOpen} onClose={() => setStockOpen(false)} />
    </header>
  );
}
