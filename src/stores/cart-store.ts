/**
 * cartStore — keranjang belanja pelanggan (STATE_MANAGEMENT.md).
 * Persist: localStorage. Catatan berlaku untuk seluruh order (CUSTOMER_UI.md).
 */
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_SWEETNESS } from "@/constants";
import type { CartItem, Product, SweetnessLevel } from "@/types";

interface CartState {
  items: CartItem[];
  notes: string;
  addItem: (
    product: Pick<Product, "id" | "name" | "photoUrl" | "price">,
    options?: { quantity?: number; sweetnessLevel?: SweetnessLevel }
  ) => void;
  removeItem: (productId: string, sweetnessLevel: SweetnessLevel) => void;
  updateQuantity: (
    productId: string,
    sweetnessLevel: SweetnessLevel,
    quantity: number
  ) => void;
  updateSweetness: (
    productId: string,
    from: SweetnessLevel,
    to: SweetnessLevel
  ) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

/** Item dibedakan berdasarkan kombinasi produk + tingkat manis. */
function sameLine(item: CartItem, productId: string, sweet: SweetnessLevel) {
  return item.productId === productId && item.sweetnessLevel === sweet;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      notes: "",

      addItem: (product, options) => {
        const quantity = options?.quantity ?? 1;
        const sweetnessLevel = options?.sweetnessLevel ?? DEFAULT_SWEETNESS;
        set((state) => {
          const existing = state.items.find((i) =>
            sameLine(i, product.id, sweetnessLevel)
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, product.id, sweetnessLevel)
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
          };
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId, sweetnessLevel) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !sameLine(i, productId, sweetnessLevel)
          ),
        })),

      updateQuantity: (productId, sweetnessLevel, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) => !sameLine(i, productId, sweetnessLevel)
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              sameLine(i, productId, sweetnessLevel) ? { ...i, quantity } : i
            ),
          };
        }),

      updateSweetness: (productId, from, to) =>
        set((state) => {
          if (from === to) return state;
          const moving = state.items.find((i) => sameLine(i, productId, from));
          if (!moving) return state;
          const rest = state.items.filter((i) => !sameLine(i, productId, from));
          const target = rest.find((i) => sameLine(i, productId, to));
          if (target) {
            return {
              items: rest.map((i) =>
                sameLine(i, productId, to)
                  ? { ...i, quantity: i.quantity + moving.quantity }
                  : i
              ),
            };
          }
          return { items: [...rest, { ...moving, sweetnessLevel: to }] };
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
