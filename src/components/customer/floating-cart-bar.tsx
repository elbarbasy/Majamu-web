"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

/**
 * Floating Cart Bar (DESIGN_SYSTEM.md): Sticky Bottom, Total Item, Total Harga.
 * Muncul hanya jika ada item (CUSTOMER_UI.md).
 */
export function FloatingCartBar() {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (totalItems === 0) return null;

  return (
    <Link
      href="/cart"
      className="flex items-center justify-between gap-3 rounded-btn bg-primary px-4 py-3 text-primary-foreground shadow-lg"
    >
      <span className="flex items-center gap-2">
        <span className="relative">
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold">
            {totalItems}
          </span>
        </span>
        <span className="text-sm font-semibold">Lihat Keranjang</span>
      </span>
      <span className="text-sm font-bold">{formatCurrency(totalPrice)}</span>
    </Link>
  );
}
