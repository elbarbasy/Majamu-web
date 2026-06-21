"use client";

import { Leaf } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/customer/product-card";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  title?: string;
}

/** Grid Produk (WIREFRAMES.md). 2 kolom mobile-first. */
export function ProductGrid({ products, loading, title }: ProductGridProps) {
  return (
    <section className="px-4 py-2">
      {title && (
        <h2 className="mb-3 text-base font-bold text-primary">{title}</h2>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-card bg-surface">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-card bg-surface py-12 text-center">
          <Leaf className="h-10 w-10 text-secondary" />
          <p className="text-sm font-medium text-black/60">
            Belum ada produk untuk filter ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
