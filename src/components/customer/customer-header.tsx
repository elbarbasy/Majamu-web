"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag } from "lucide-react";

import { getPublicSettings } from "@/services/settings.service";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";

/**
 * Header Customer — sticky, 56px, premium.
 * Logo dari settings (upload) ditampilkan jika ada; fallback teks "MAJAMU".
 */
export function CustomerHeader() {
  const openInfoPanel = useUiStore((s) => s.openInfoPanel);
  const openSearch = useUiStore((s) => s.openSearch);
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    getPublicSettings().then((s) => setLogoUrl(s.logoUrl));
  }, []);

  return (
    <header className="no-print sticky top-0 z-30 border-b border-line/70 bg-background/85 backdrop-blur-xl">
      <div className="relative mx-auto flex h-14 max-w-screen-sm items-center justify-between px-3">
        {/* Kiri */}
        <button
          onClick={openInfoPanel}
          aria-label="Buka menu"
          className="touch-target flex items-center justify-center rounded-btn text-ink/80 transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Tengah: logo */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 select-none"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Majamu"
              className="h-9 max-w-[130px] object-contain"
            />
          ) : (
            <span className="text-lg font-extrabold tracking-[0.18em] text-primary">
              MAJAMU
            </span>
          )}
        </Link>

        {/* Kanan */}
        <div className="flex items-center gap-1">
          <button
            onClick={openSearch}
            aria-label="Cari"
            className="touch-target flex items-center justify-center rounded-btn text-ink/80 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Search className="h-[22px] w-[22px]" />
          </button>
          <Link
            href="/cart"
            aria-label="Keranjang"
            className="touch-target relative flex items-center justify-center rounded-btn text-ink/80 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <ShoppingBag className="h-[22px] w-[22px]" />
            {count > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
