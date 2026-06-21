"use client";

import * as React from "react";
import { Leaf, Search } from "lucide-react";
import Image from "next/image";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { formatCurrency } from "@/lib/utils";
import { getProducts } from "@/services/products.service";
import { useUiStore } from "@/stores/ui-store";
import type { Product } from "@/types";

/** Search Menu (CUSTOMER_UI.md header). Bottom sheet dengan input + hasil live. */
export function SearchSheet() {
  const open = useUiStore((s) => s.searchOpen);
  const close = useUiStore((s) => s.closeSearch);
  const openDetail = useUiStore((s) => s.openProductDetail);

  const [query, setQuery] = React.useState("");
  const [products, setProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      getProducts().then(setProducts);
    }
  }, [open]);

  const q = query.trim().toLowerCase();
  const results = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.filterChips.some((c) => c.toLowerCase().includes(q)) ||
          p.ingredients.some((i) => i.toLowerCase().includes(q))
      )
    : products;

  return (
    <BottomSheet open={open} onClose={close} fullScreen title="Cari Menu">
      <div className="sticky top-0 z-10 -mx-4 bg-surface px-4 pb-3">
        <div className="flex items-center gap-2 rounded-btn border border-black/15 px-3">
          <Search className="h-5 w-5 text-black/40" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari jamu, manfaat, atau bahan…"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-black/40"
          />
        </div>
      </div>

      {results.length === 0 ? (
        <p className="py-10 text-center text-sm text-black/50">
          Tidak ada hasil untuk &quot;{query}&quot;.
        </p>
      ) : (
        <ul className="divide-y divide-black/5">
          {results.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => {
                  openDetail(p.id);
                  close();
                }}
                className="flex w-full items-center gap-3 py-3 text-left"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-card bg-secondary/20">
                  {p.photoUrl ? (
                    <Image
                      src={p.photoUrl}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-secondary">
                      <Leaf className="h-6 w-6" />
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-black/85">
                    {p.name}
                  </span>
                  <span className="block text-sm font-bold text-primary">
                    {formatCurrency(p.price)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </BottomSheet>
  );
}
