"use client";

import { Leaf } from "lucide-react";

import { ProductCard } from "@/components/customer/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
}

/** Grid produk — 2 kolom mobile, gap konsisten, judul seksi bersih. */
export function ProductGrid({
  products,
  loading,
  title,
  subtitle,
}: ProductGridProps) {
  return (
    <section className="px-4 py-3">
      {title && (
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-title font-semibold text-ink">{title}</h2>
          {subtitle && (
            <span className="text-xs font-medium text-muted">{subtitle}</span>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-card border border-line bg-surface"
            >
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-2 p-3.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-line bg-surface py-14 text-center">
          <Leaf className="h-10 w-10 text-secondary" />
          <p className="text-sm font-medium text-muted">
            Belum ada produk untuk kategori ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
