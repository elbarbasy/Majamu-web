"use client";

import * as React from "react";
import { ChevronDown, Leaf, Snowflake, Flame } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { OptionPills } from "@/components/ui/option-pills";
import { QuantityControl } from "@/components/ui/quantity-control";
import {
  CUSTOMER_SWEETNESS_LEVELS,
  DEFAULT_SWEETNESS,
  DEFAULT_TEMPERATURE,
  TEMPERATURE_LEVELS,
} from "@/constants";
import { cn, formatCurrency } from "@/lib/utils";
import { getProductById } from "@/services/products.service";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import type { Product, SweetnessLevel, TemperatureLevel } from "@/types";

/**
 * Detail Produk — bottom sheet premium. Selector Suhu & Tingkat Manis
 * hanya tampil bila diaktifkan pada produk (kustomisasi per produk).
 * Snapshot kustomisasi ikut tersimpan saat ditambahkan ke keranjang.
 */
export function ProductDetailSheet() {
  const productId = useUiStore((s) => s.detailProductId);
  const close = useUiStore((s) => s.closeProductDetail);
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);
  const [sweetness, setSweetness] = React.useState<SweetnessLevel>(DEFAULT_SWEETNESS);
  const [temperature, setTemperature] =
    React.useState<TemperatureLevel>(DEFAULT_TEMPERATURE);
  const [showComposition, setShowComposition] = React.useState(false);

  const open = Boolean(productId);

  React.useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setQuantity(1);
    setSweetness(DEFAULT_SWEETNESS);
    setTemperature(DEFAULT_TEMPERATURE);
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
      {
        quantity,
        sweetnessLevel: product.sweetnessEnabled ? sweetness : null,
        temperature: product.temperatureEnabled ? temperature : null,
      }
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
        <div className="py-12 text-center text-sm text-muted">Memuat…</div>
      ) : (
        <div className="space-y-5">
          {/* Foto */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card bg-secondary/15">
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
                <Leaf className="h-14 w-14" />
              </span>
            )}
          </div>

          {/* Nama & harga */}
          <div>
            <h3 className="font-display text-title font-medium leading-snug text-ink">
              {product.name}
            </h3>
            <p className="mt-1 text-lead font-semibold tabular text-primary">
              {formatCurrency(product.price)}
            </p>
          </div>

          {/* Benefit chips */}
          {product.filterChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.filterChips
                .filter((c) => c !== "Semua")
                .map((c) => (
                  <Badge key={c} variant="accent">
                    {c}
                  </Badge>
                ))}
            </div>
          )}

          {/* Deskripsi */}
          {product.description && (
            <p className="text-sm leading-relaxed text-ink/75">
              {product.description}
            </p>
          )}
          {product.contextualDescription && (
            <p className="rounded-card bg-accent/10 p-3.5 text-sm leading-relaxed text-accent">
              {product.contextualDescription}
            </p>
          )}

          {/* Komposisi */}
          {product.ingredients.length > 0 && (
            <div className="overflow-hidden rounded-card border border-line">
              <button
                onClick={() => setShowComposition((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-bold text-ink"
              >
                Komposisi
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted transition-transform",
                    showComposition && "rotate-180"
                  )}
                />
              </button>
              {showComposition && (
                <div className="flex flex-wrap gap-2 px-4 pb-4">
                  {product.ingredients.map((i) => (
                    <Badge key={i} variant="secondary">
                      {i}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Suhu (per produk) */}
          {product.temperatureEnabled && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink">
                <Flame className="h-4 w-4 text-warning" />
                Suhu Minuman
              </p>
              <OptionPills
                options={TEMPERATURE_LEVELS}
                value={temperature}
                onChange={setTemperature}
              />
            </div>
          )}

          {/* Tingkat manis (per produk) */}
          {product.sweetnessEnabled && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink">
                <Snowflake className="h-4 w-4 text-accent" />
                Tingkat Kemanisan
              </p>
              <OptionPills
                options={CUSTOMER_SWEETNESS_LEVELS}
                value={sweetness}
                onChange={setSweetness}
              />
            </div>
          )}

          {/* Jumlah */}
          <div className="flex items-center justify-between rounded-card bg-background px-4 py-3">
            <p className="text-sm font-bold text-ink">Jumlah</p>
            <QuantityControl value={quantity} onChange={setQuantity} />
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
