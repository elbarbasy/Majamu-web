/**
 * storeStatusStore — status buka/tutup toko (global, agar bisa diakses
 * dari product card, detail sheet, dan checkout tanpa prop drilling).
 */
"use client";

import { create } from "zustand";

interface StoreStatusState {
  isClosed: boolean;
  setIsClosed: (v: boolean) => void;
}

export const useStoreStatusStore = create<StoreStatusState>((set) => ({
  isClosed: false,
  setIsClosed: (v) => set({ isClosed: v }),
}));
