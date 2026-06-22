"use client";

import { Leaf, Trash2 } from "lucide-react";

import { QuantityControl } from "@/components/ui/quantity-control";
import { sweetnessLabel, temperatureLabel } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { CartItem } from "@/types";

interface CartItemRowProps {
  item: CartItem;
}

/** Baris item keranjang — menampilkan kustomisasi (suhu & tingkat manis). */
export function CartItemRow({ item }: CartItemRowProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const customizations = [
    item.temperature ? temperatureLabel(item.temperature) : null,
    item.sweetnessLevel ? sweetnessLabel(item.sweetnessLevel) : null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex gap-3 rounded-card border border-line bg-surface p-3 shadow-soft-sm">
      <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-secondary/15">
        {item.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.photoUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-secondary">
            <Leaf className="h-7 w-7" />
          </span>
        )}
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="clamp-1 text-sm font-bold text-ink">{item.name}</p>
            {customizations.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {customizations.map((c) => (
                  <span
                    key={c}
                    className="rounded-pill bg-accent/12 px-2 py-0.5 text-[11px] font-semibold text-accent"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() =>
              removeItem(item.productId, item.sweetnessLevel, item.temperature)
            }
            aria-label="Hapus item"
            className="touch-target -mr-2 flex items-center justify-center text-muted hover:text-error"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-extrabold text-primary">
            {formatCurrency(item.price * item.quantity)}
          </span>
          <QuantityControl
            size="sm"
            value={item.quantity}
            onChange={(q) =>
              updateQuantity(
                item.productId,
                item.sweetnessLevel,
                item.temperature,
                q
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
