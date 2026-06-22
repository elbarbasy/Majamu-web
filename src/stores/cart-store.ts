/**
 * cartStore — keranjang belanja pelanggan (STATE_MANAGEMENT.md).
 * Persist: localStorage. Item dibedakan berdasarkan kombinasi
 * produk + tingkat manis + suhu (kustomisasi per produk).
 */
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_SWEETNESS } from "@/constants";
import type { CartItem, Product, SweetnessLevel, TemperatureLevel } from "@/types";

interface AddOptions {
  quantity?: number;
  sweetnessLevel?: SweetnessLevel | null;
  temperature?: TemperatureLevel | null;
}

interface CartState {
  items: CartItem[];
  notes: string;
  addItem: (
    product: Pick<Product, "id" | "name" | "photoUrl" | "price">,
    options?: AddOptions
  ) => void;
  removeItem: (
    productId: string,
    sweetnessLevel: SweetnessLevel | null,
    temperature: TemperatureLevel | null
  ) => void;
  updateQuantity: (
    productId: string,
    sweetnessLevel: SweetnessLevel | null,
    temperature: TemperatureLevel | null,
    quantity: number
  ) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

/** Identitas baris keranjang: produk + tingkat manis + suhu. */
function sameLine(
  item: CartItem,
  productId: string,
  sweet: SweetnessLevel | null,
  temp: TemperatureLevel | null
) {
  return (
    item.productId === productId &&
    item.sweetnessLevel === sweet &&
    item.temperature === temp
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      notes: "",

      addItem: (product, options) => {
        const quantity = options?.quantity ?? 1;
        const sweetnessLevel =
          options?.sweetnessLevel === undefined
            ? DEFAULT_SWEETNESS
            : options.sweetnessLevel;
        const temperature = options?.temperature ?? null;

        set((state) => {
          const existing = state.items.find((i) =>
            sameLine(i, product.id, sweetnessLevel, temperature)
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, product.id, sweetnessLevel, temperature)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          const newItem: CartItem = {
            productId: product.id,
            name: product.name,
            photoUrl: product.photoUrl,
            price: product.price,
            quantity,
            sweetnessLevel,
            temperature,
          };
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId, sweetnessLevel, temperature) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !sameLine(i, productId, sweetnessLevel, temperature)
          ),
        })),

      updateQuantity: (productId, sweetnessLevel, temperature, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) => !sameLine(i, productId, sweetnessLevel, temperature)
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              sameLine(i, productId, sweetnessLevel, temperature)
                ? { ...i, quantity }
                : i
            ),
          };
        }),

      setNotes: (notes) => set({ notes }),

      clearCart: () => set({ items: [], notes: "" }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "majamu-cart" }
  )
);
