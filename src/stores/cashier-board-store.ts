/**
 * cashierBoardStore — state Order Board realtime (STATE_MANAGEMENT.md).
 * Tidak dipersist (data berasal dari Supabase / realtime). Mendukung
 * perpindahan status optimistik agar board terasa instan.
 */
"use client";

import { create } from "zustand";

import type { CashierOrder, OrderStatus } from "@/types";

interface CashierBoardState {
  orders: CashierOrder[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setOrders: (orders: CashierOrder[]) => void;
  /** Pindahkan status order secara optimistik; hapus dari board bila selesai. */
  moveStatus: (orderId: string, status: OrderStatus) => void;
}

export const useCashierBoardStore = create<CashierBoardState>((set) => ({
  orders: [],
  loading: true,

  setLoading: (loading) => set({ loading }),

  setOrders: (orders) => set({ orders, loading: false }),

  moveStatus: (orderId, status) =>
    set((state) => {
      if (status === "selesai") {
        return { orders: state.orders.filter((o) => o.id !== orderId) };
      }
      return {
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status } : o
        ),
      };
    }),
}));
