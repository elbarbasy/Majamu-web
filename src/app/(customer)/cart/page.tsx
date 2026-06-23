"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import { CartItemRow } from "@/components/customer/cart-item-row";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

/**
 * Keranjang (CUSTOMER_UI.md / WIREFRAMES.md):
 * Produk Dipilih, Catatan Pesanan (untuk seluruh order), Ringkasan Harga, Checkout.
 */
export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const notes = useCartStore((s) => s.notes);
  const setNotes = useCartStore((s) => s.setNotes);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      {/* Sub-header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="touch-target flex items-center justify-center rounded-full text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-page font-medium tracking-tight text-ink">Keranjang</h1>
      </div>

      {!mounted ? null : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <ShoppingBag className="h-12 w-12 text-secondary" />
          <p className="text-sm font-medium text-black/60">
            Keranjang masih kosong.
          </p>
          <Link href="/">
            <Button variant="outline">Lihat Menu</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 px-4 pb-40">
            {/* Produk Dipilih */}
            <div className="space-y-3">
              {items.map((item) => (
                <CartItemRow
                  key={`${item.productId}-${item.sweetnessLevel}-${item.temperature}`}
                  item={item}
                />
              ))}
            </div>

            {/* Catatan Pesanan */}
            <div className="rounded-card bg-surface p-3 shadow-sm">
              <label
                htmlFor="order-notes"
                className="mb-2 block text-sm font-semibold text-black/80"
              >
                Catatan Pesanan
              </label>
              <textarea
                id="order-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Catatan untuk seluruh pesanan (opsional)…"
                className="w-full resize-none rounded-card border border-black/15 p-3 text-sm outline-none focus:border-primary"
              />
            </div>

            {/* Ringkasan Harga */}
            <div className="rounded-card bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm text-black/60">
                <span>Total Item</span>
                <span>{totalItems} item</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-black/80">
                  Total Harga
                </span>
                <span className="text-lg font-extrabold text-primary">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Aksi sticky */}
          <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-surface">
            <div className="mx-auto max-w-screen-sm px-4 py-3">
              <Button block size="lg" onClick={() => router.push("/checkout")}>
                Checkout • {formatCurrency(totalPrice)}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
