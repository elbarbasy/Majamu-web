"use client";

import Image from "next/image";
import { Leaf, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

/** Product Card (DESIGN_SYSTEM.md): Image, Name, Price, Quick Add. */
export function ProductCard({ product }: ProductCardProps) {
  const openDetail = useUiStore((s) => s.openProductDetail);
  const addItem = useCartStore((s) => s.addItem);

  const soldOut = product.stockStatus === "out_of_stock";

  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-surface shadow-sm">
      <button
        onClick={() => openDetail(product.id)}
        className="relative aspect-square w-full bg-secondary/20"
        aria-label={`Lihat detail ${product.name}`}
      >
        {product.photoUrl ? (
          <Image
            src={product.photoUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 280px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-secondary">
            <Leaf className="h-10 w-10" />
          </span>
        )}
        {soldOut && (
          <span className="absolute left-2 top-2">
            <Badge variant="error">Stok Habis</Badge>
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-3">
        <button
          onClick={() => openDetail(product.id)}
          className="line-clamp-2 text-left text-sm font-semibold text-black/85"
        >
          {product.name}
        </button>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          <button
            aria-label={`Tambah ${product.name} ke keranjang`}
            disabled={soldOut}
            onClick={() =>
              addItem({
                id: product.id,
                name: product.name,
                photoUrl: product.photoUrl,
                price: product.price,
              })
            }
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
