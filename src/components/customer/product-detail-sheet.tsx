"use client";

import * as React from "react";
import { ChevronDown, Leaf } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { QuantityControl } from "@/components/ui/quantity-control";
import { SweetnessSelector } from "@/components/ui/sweetness-selector";
import { DEFAULT_SWEETNESS } from "@/constants";
import { cn, formatCurrency } from "@/lib/utils";
import { getProductById } from "@/services/products.service";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import type { Product, SweetnessLevel } from "@/types";

/**
 * Detail Produk sebagai Bottom Sheet (CUSTOMER_UI.md / WIREFRAMES.md):
 * Foto, Nama+Harga, Chip Manfaat, Deskripsi Utama, Deskripsi Kontekstual,
 * Komposisi (collapsible), Tingkat Manis, Kontrol Jumlah, Tombol Aksi Sticky.
 */
export function ProductDetailSheet() {
  const productId = useUiStore((s) => s.detailProductId);
  const close = useUiStore((s) => s.closeProductDetail);
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);
  const [sweetness, setSweetness] = React.useState<SweetnessLevel>(DEFAULT_SWEETNESS);
  const [showComposition, setShowComposition] = React.useState(false);

  const open = Boolean(productId);

  React.useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setQuantity(1);
    setSweetness(DEFAULT_SWEETNESS);
    setShowComposition(false);
    let active = true;
    getProductById(productId).then((p) => {
      if (active) {
        setProduct(p);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [productId]);

  const soldOut = product?.stockStatus === "out_of_stock";

  function handleAdd() {
    if (!product || soldOut) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        photoUrl: product.photoUrl,
        price: product.price,
      },
      { quantity, sweetnessLevel: sweetness }
    );
    close();
  }

  return (
    <BottomSheet
      open={open}
      onClose={close}
      footer={
        product ? (
          <Button block size="lg" onClick={handleAdd} disabled={soldOut}>
            {soldOut
              ? "Stok Habis"
              : `Tambah ke Keranjang • ${formatCurrency(product.price * quantity)}`}
          </Button>
        ) : null
      }
    >
      {loading || !product ? (
        <div className="py-10 text-center text-sm text-black/50">Memuat…</div>
      ) : (
        <div className="space-y-4">
          {/* Foto */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card bg-secondary/20">
            {product.photoUrl ? (
              <Image
                src={product.photoUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 560px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-secondary">
                <Leaf className="h-12 w-12" />
              </span>
            )}
          </div>

          {/* Nama & Harga */}
          <div>
            <h3 className="text-lg font-bold text-black/90">{product.name}</h3>
            <p className="text-lg font-extrabold text-primary">
              {formatCurrency(product.price)}
            </p>
          </div>

          {/* Chip Manfaat */}
          {product.filterChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.filterChips.map((c) => (
                <Badge key={c} variant="accent">
                  {c}
                </Badge>
              ))}
            </div>
          )}

          {/* Deskripsi Utama */}
          {product.description && (
            <p className="text-sm leading-relaxed text-black/70">
              {product.description}
            </p>
          )}

          {/* Deskripsi Kontekstual */}
          {product.contextualDescription && (
            <p className="rounded-card bg-accent/10 p-3 text-sm text-accent">
              {product.contextualDescription}
            </p>
          )}

          {/* Komposisi (collapsible) */}
          {product.ingredients.length > 0 && (
            <div className="rounded-card border border-black/10">
              <button
                onClick={() => setShowComposition((v) => !v)}
                className="flex w-full items-center justify-between px-3 py-3 text-sm font-semibold text-black/80"
              >
                Komposisi
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    showComposition && "rotate-180"
                  )}
                />
              </button>
              {showComposition && (
                <div className="flex flex-wrap gap-2 px-3 pb-3">
                  {product.ingredients.map((i) => (
                    <Badge key={i} variant="secondary">
                      {i}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tingkat Manis */}
          <div>
            <p className="mb-2 text-sm font-semibold text-black/80">
              Tingkat Manis
            </p>
            <SweetnessSelector value={sweetness} onChange={setSweetness} />
          </div>

          {/* Kontrol Jumlah */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-black/80">Jumlah</p>
            <QuantityControl value={quantity} onChange={setQuantity} />
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
