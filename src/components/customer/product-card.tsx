"use client";

import Image from "next/image";
import { Leaf, Plus } from "lucide-react";

import { DEFAULT_SWEETNESS, DEFAULT_TEMPERATURE } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

/**
 * Product Card premium — flex column, tinggi mengikuti konten.
 * Susunan: Foto → Nama → Harga → (Benefit chip + tombol +).
 * Tanpa absolute untuk info, tanpa overlap teks/harga/badge.
 */
export function ProductCard({ product }: ProductCardProps) {
  const openDetail = useUiStore((s) => s.openProductDetail);
  const addItem = useCartStore((s) => s.addItem);

  const soldOut = product.stockStatus === "out_of_stock";
  const benefit = product.filterChips.find(
    (c) => c !== "Semua" && c !== "Rekomendasi"
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-soft-sm transition-transform duration-200 active:scale-[0.99]">
      {/* Foto */}
      <button
        onClick={() => openDetail(product.id)}
        aria-label={`Lihat detail ${product.name}`}
        className="relative aspect-square w-full bg-secondary/15"
      >
        {product.photoUrl ? (
          <Image
            src={product.photoUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 260px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-secondary">
            <Leaf className="h-12 w-12" />
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-surface/70">
            <span className="rounded-pill bg-ink/80 px-3 py-1 text-xs font-semibold text-white">
              Stok Habis
            </span>
          </span>
        )}
      </button>

      {/* Konten */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <button
          onClick={() => openDetail(product.id)}
          className="clamp-2 min-h-[2.5rem] text-left text-sm font-bold leading-snug text-ink"
        >
          {product.name}
        </button>

        <span className="text-base font-extrabold text-primary">
          {formatCurrency(product.price)}
        </span>

        {/* Benefit chip + tombol tambah */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          {benefit ? (
            <span className="clamp-1 max-w-[70%] rounded-pill bg-accent/12 px-2.5 py-1 text-[11px] font-semibold text-accent">
              {benefit}
            </span>
          ) : (
            <span />
          )}
          <button
            aria-label={`Tambah ${product.name}`}
            disabled={soldOut}
            onClick={() =>
              addItem(
                {
                  id: product.id,
                  name: product.name,
                  photoUrl: product.photoUrl,
                  price: product.price,
                },
                {
                  sweetnessLevel: product.sweetnessEnabled
                    ? DEFAULT_SWEETNESS
                    : null,
                  temperature: product.temperatureEnabled
                    ? DEFAULT_TEMPERATURE
                    : null,
                }
              )
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-primary text-primary-foreground shadow-soft-sm transition active:scale-90 disabled:opacity-40"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
