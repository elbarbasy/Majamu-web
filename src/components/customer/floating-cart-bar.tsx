"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

/**
 * Floating Cart Bar — seluruh bar clickable, melayang, shadow lembut.
 * Format: "{n} Item • {total}"  ·  "Lihat Keranjang →". Logika cart tetap.
 */
export function FloatingCartBar() {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (totalItems === 0) return null;

  return (
    <Link
      href="/cart"
      className="flex items-center justify-between gap-3 rounded-card bg-primary px-5 py-3.5 text-primary-foreground shadow-soft-lg transition active:scale-[0.99]"
    >
      <span className="flex items-center gap-3">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
          <ShoppingBag className="h-5 w-5" />
        </span>
        <span className="leading-tight">
          <span className="block text-[13px] font-semibold">
            {totalItems} Item
          </span>
          <span className="block text-sm font-extrabold">
            {formatCurrency(totalPrice)}
          </span>
        </span>
      </span>
      <span className="flex items-center gap-1 text-sm font-bold">
        Lihat Keranjang
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
