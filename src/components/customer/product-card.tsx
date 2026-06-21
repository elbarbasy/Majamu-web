"use client";

import Image from "next/image";
import { Leaf, Plus } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

/**
 * Product Card — flex column, tinggi mengikuti konten, tanpa overlap.
 * Susunan: Foto → Kategori → Nama → Deskripsi → (Harga + Tombol tambah).
 * Tidak ada absolute positioning untuk informasi produk. Logika lama dijaga
 * (openProductDetail, addItem, stockStatus).
 */
export function ProductCard({ product }: ProductCardProps) {
  const openDetail = useUiStore((s) => s.openProductDetail);
  const addItem = useCartStore((s) => s.addItem);

  const soldOut = product.stockStatus === "out_of_stock";
  const category = product.filterChips.find(
    (c) => c !== "Semua" && c !== "Rekomendasi"
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-soft-sm">
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
            <Leaf className="h-10 w-10" />
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-surface/70">
            <span className="rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-white">
              Stok Habis
            </span>
          </span>
        )}
      </button>

      {/* Konten */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        {category && (
          <span className="w-fit rounded-full bg-accent/12 px-2 py-0.5 text-[11px] font-semibold text-accent">
            {category}
          </span>
        )}

        <button
          onClick={() => openDetail(product.id)}
          className="clamp-2 text-left text-sm font-bold leading-snug text-ink"
        >
          {product.name}
        </button>

        {product.description && (
          <p className="clamp-2 text-xs leading-relaxed text-muted">
            {product.description}
          </p>
        )}

        {/* Harga + tombol (mt-auto agar selalu menempel bawah, sejajar antar-card) */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="min-w-0">
            <span className="block text-[10px] font-medium uppercase tracking-wide text-muted">
              Harga
            </span>
            <span className="block truncate text-sm font-extrabold text-primary">
              {formatCurrency(product.price)}
            </span>
          </div>
          <button
            aria-label={`Tambah ${product.name}`}
            disabled={soldOut}
            onClick={() =>
              addItem({
                id: product.id,
                name: product.name,
                photoUrl: product.photoUrl,
                price: product.price,
              })
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-primary text-primary-foreground shadow-soft-sm transition active:scale-95 disabled:opacity-40"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
