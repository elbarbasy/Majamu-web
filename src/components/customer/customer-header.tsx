"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";

import { useUiStore } from "@/stores/ui-store";

/**
 * Header Customer (CUSTOMER_UI.md / DESIGN_SYSTEM.md):
 * - Icon menu di KIRI logo (bukan hamburger generik untuk navigasi utama,
 *   hanya membuka panel informasi & riwayat)
 * - Logo Majamu di tengah-kiri
 * - Search di kanan
 * Sticky di atas. Tidak ada bottom navigation.
 */
export function CustomerHeader() {
  const openInfoPanel = useUiStore((s) => s.openInfoPanel);
  const openSearch = useUiStore((s) => s.openSearch);

  return (
    <header className="no-print sticky top-0 z-30 h-14 border-b border-black/5 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-screen-sm items-center justify-between px-3">
        <div className="flex items-center gap-1">
          <button
            onClick={openInfoPanel}
            aria-label="Buka menu informasi"
            className="touch-target flex items-center justify-center rounded-full text-primary hover:bg-primary/10"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link
            href="/"
            className="select-none text-lg font-extrabold tracking-tight text-primary"
          >
            Majamu
          </Link>
        </div>
        <button
          onClick={openSearch}
          aria-label="Cari menu"
          className="touch-target flex items-center justify-center rounded-full text-primary hover:bg-primary/10"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
