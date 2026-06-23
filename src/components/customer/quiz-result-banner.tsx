"use client";

import * as React from "react";
import { Sparkles, X } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { getProducts } from "@/services/products.service";
import { useUiStore } from "@/stores/ui-store";
import type { Product } from "@/types";

const SESSION_KEY = "majamu-quiz-v2-result";

/**
 * Banner rekomendasi (muncul di homepage jika ada hasil quiz di sessionStorage).
 * Bertahan selama navigasi, hilang saat browser session berakhir.
 */
export function QuizResultBanner() {
  const openDetail = useUiStore((s) => s.openProductDetail);
  const [topProduct, setTopProduct] = React.useState<Product | null>(null);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (!saved) return;
      const ids: string[] = JSON.parse(saved);
      if (!Array.isArray(ids) || ids.length === 0) return;
      getProducts().then((all) => {
        const top = all.find((p) => p.id === ids[0]);
        if (top) setTopProduct(top);
      });
    } catch {
      /* ignore */
    }
  }, []);

  if (!topProduct || dismissed) return null;

  return (
    <div className="mx-4 mt-3 overflow-hidden rounded-card border border-accent/30 bg-accent/5 shadow-soft-sm">
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={() => openDetail(topProduct.id)}
          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-secondary/15"
        >
          {topProduct.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={topProduct.photoUrl}
              alt={topProduct.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-accent">
              <Sparkles className="h-6 w-6" />
            </span>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-accent">⭐ Rekomendasi untukmu</p>
          <p className="truncate text-sm font-bold text-ink">{topProduct.name}</p>
          <p className="text-sm font-extrabold text-primary">
            {formatCurrency(topProduct.price)}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Tutup"
          className="shrink-0 text-muted hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
