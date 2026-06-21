/**
 * customerHistoryStore — riwayat pesanan tanpa login (STATE_MANAGEMENT.md).
 * Persist: localStorage, maksimal 30 riwayat (CUSTOMER_UI.md).
 */
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { HISTORY_LIMIT } from "@/constants";
import type { CustomerHistoryOrder, OrderStatus } from "@/types";

interface CustomerHistoryState {
  orders: CustomerHistoryOrder[];
  addHistory: (order: CustomerHistoryOrder) => void;
  updateStatus: (orderId: string, status: OrderStatus) => void;
  removeHistory: (orderId: string) => void;
  clearHistory: () => void;
}

export const useCustomerHistoryStore = create<CustomerHistoryState>()(
  persist(
    (set) => ({
      orders: [],

      addHistory: (order) =>
        set((state) => {
          const deduped = state.orders.filter(
            (o) => o.orderId !== order.orderId
          );
          return {
            orders: [order, ...deduped].slice(0, HISTORY_LIMIT),
          };
        }),

      updateStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.orderId === orderId ? { ...o, status } : o
          ),
        })),

      removeHistory: (orderId) =>
        set((state) => ({
          orders: state.orders.filter((o) => o.orderId !== orderId),
        })),

      clearHistory: () => set({ orders: [] }),
    }),
    { name: "majamu-history" }
  )
);
