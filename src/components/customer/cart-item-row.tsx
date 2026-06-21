"use client";

import Image from "next/image";
import { Leaf, Trash2 } from "lucide-react";

import { QuantityControl } from "@/components/ui/quantity-control";
import { sweetnessLabel } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { CartItem } from "@/types";

interface CartItemRowProps {
  item: CartItem;
}

/** Baris item keranjang (CUSTOMER_UI.md / WIREFRAMES.md Cart). */
export function CartItemRow({ item }: CartItemRowProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-3 rounded-card bg-surface p-3 shadow-sm">
      <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-card bg-secondary/20">
        {item.photoUrl ? (
          <Image
            src={item.photoUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
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
            <p className="truncate text-sm font-semibold text-black/85">
              {item.name}
            </p>
            <p className="text-xs text-black/50">
              {sweetnessLabel(item.sweetnessLevel)}
            </p>
          </div>
          <button
            onClick={() => removeItem(item.productId, item.sweetnessLevel)}
            aria-label="Hapus item"
            className="touch-target -mr-2 flex items-center justify-center text-black/40 hover:text-error"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-bold text-primary">
            {formatCurrency(item.price * item.quantity)}
          </span>
          <QuantityControl
            size="sm"
            value={item.quantity}
            onChange={(q) =>
              updateQuantity(item.productId, item.sweetnessLevel, q)
            }
          />
        </div>
      </div>
    </div>
  );
}
