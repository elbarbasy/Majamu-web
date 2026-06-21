"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag } from "lucide-react";

import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";

/**
 * Header Customer — sticky, premium wellness.
 * Kiri: hamburger (buka SideDrawer). Tengah-kiri: logo Majamu.
 * Kanan: ikon keranjang (link /cart). Baris bawah: search bar modern
 * (membuka SearchSheet). Semua logika lama dipertahankan (ui-store, cart-store).
 */
export function CustomerHeader() {
  const openInfoPanel = useUiStore((s) => s.openInfoPanel);
  const openSearch = useUiStore((s) => s.openSearch);
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="no-print sticky top-0 z-30 border-b border-line/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto max-w-screen-sm px-4">
        {/* Top row */}
        <div className="flex h-14 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={openInfoPanel}
              aria-label="Buka menu"
              className="touch-target -ml-2 flex items-center justify-center rounded-btn text-ink/80 transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="flex items-center gap-2 select-none">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">
                M
              </span>
              <span className="text-lg font-extrabold tracking-tight text-primary">
                Majamu
              </span>
            </Link>
          </div>

          <Link
            href="/cart"
            aria-label="Keranjang"
            className="touch-target relative -mr-2 flex items-center justify-center rounded-btn text-ink/80 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <ShoppingBag className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>

        {/* Search bar */}
        <div className="pb-3">
          <button
            onClick={openSearch}
            className="flex w-full items-center gap-2.5 rounded-input border border-line bg-surface px-4 py-2.5 text-left text-sm text-muted shadow-soft-sm transition-colors hover:border-primary/30"
          >
            <Search className="h-4 w-4 text-primary" />
            <span>Cari jamu, manfaat, atau bahan…</span>
          </button>
        </div>
      </div>
    </header>
  );
}
