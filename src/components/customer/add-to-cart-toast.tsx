"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";

import { useCartStore } from "@/stores/cart-store";

/**
 * Toast popup "Berhasil ditambahkan ke keranjang" — muncul 1 detik lalu hilang.
 * Mendeteksi perubahan jumlah item di cart store.
 */
export function AddToCartToast() {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const [show, setShow] = React.useState(false);
  const prevCount = React.useRef(totalItems);

  React.useEffect(() => {
    if (totalItems > prevCount.current) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 1000);
      return () => clearTimeout(t);
    }
    prevCount.current = totalItems;
  }, [totalItems]);

  // Update ref setelah show selesai
  React.useEffect(() => {
    if (!show) prevCount.current = totalItems;
  }, [show, totalItems]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4">
      <div className="pointer-events-auto animate-fade-in rounded-card border border-accent/30 bg-surface px-4 py-3 shadow-soft-lg">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold text-ink">
            Berhasil ditambahkan ke keranjang
          </span>
        </div>
      </div>
    </div>
  );
}
