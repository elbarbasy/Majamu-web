/**
 * activeOrderStore — melacak pesanan aktif pelanggan (STATE_MANAGEMENT.md).
 * Dipakai untuk badge "Pesanan Aktif" di homepage. Persist: localStorage.
 */
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { OrderStatus } from "@/types";

interface ActiveOrderState {
  orderId: string | null;
  statusUrl: string | null;
  receiptNumber: string | null;
  displayNumber: string | null;
  currentStatus: OrderStatus | null;
  setActiveOrder: (order: {
    orderId: string;
    statusUrl: string;
    receiptNumber?: string | null;
    displayNumber?: string | null;
    currentStatus: OrderStatus;
  }) => void;
  updateStatus: (status: OrderStatus) => void;
  clearActiveOrder: () => void;
}

export const useActiveOrderStore = create<ActiveOrderState>()(
  persist(
    (set) => ({
      orderId: null,
      statusUrl: null,
      receiptNumber: null,
      displayNumber: null,
      currentStatus: null,

      setActiveOrder: (order) =>
        set({
          orderId: order.orderId,
          statusUrl: order.statusUrl,
          receiptNumber: order.receiptNumber ?? null,
          displayNumber: order.displayNumber ?? null,
          currentStatus: order.currentStatus,
        }),

      updateStatus: (status) => set({ currentStatus: status }),

      clearActiveOrder: () =>
        set({
          orderId: null,
          statusUrl: null,
          receiptNumber: null,
          displayNumber: null,
          currentStatus: null,
        }),
    }),
    { name: "majamu-active-order" }
  )
);
