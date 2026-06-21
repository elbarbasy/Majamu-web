"use client";

import * as React from "react";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";
import {
  fetchStockProducts,
  setStockStatus,
  type StockProduct,
} from "@/services/cashier.service";

interface StockSheetProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Toggle Stok Habis Hari Ini (CASHIER_UI.md). Daftar produk + switch
 * tersedia / habis. Pembaruan optimistik.
 */
export function StockSheet({ open, onClose }: StockSheetProps) {
  const [products, setProducts] = React.useState<StockProduct[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchStockProducts().then((p) => {
      setProducts(p);
      setLoading(false);
    });
  }, [open]);

  function toggle(p: StockProduct) {
    const next = p.stockStatus === "available" ? "out_of_stock" : "available";
    setProducts((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, stockStatus: next } : x))
    );
    setStockStatus(p.id, next);
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Stok Habis Hari Ini">
      {loading ? (
        <p className="py-8 text-center text-sm text-black/50">Memuat…</p>
      ) : products.length === 0 ? (
        <p className="py-8 text-center text-sm text-black/50">
          Tidak ada produk.
        </p>
      ) : (
        <ul className="divide-y divide-black/5">
          {products.map((p) => {
            const available = p.stockStatus === "available";
            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="text-sm font-medium text-black/80">
                  {p.name}
                </span>
                <button
                  onClick={() => toggle(p)}
                  role="switch"
                  aria-checked={available}
                  className={cn(
                    "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                    available ? "bg-accent" : "bg-black/20"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 h-5 w-5 rounded-full bg-white transition-all",
                      available ? "left-6" : "left-1"
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-center text-xs text-black/40">
        Hijau = tersedia, abu = stok habis hari ini.
      </p>
    </BottomSheet>
  );
}
