/**
 * cashierSettingsStore — preferensi kasir (persist localStorage).
 * Suara pesanan baru ON/OFF + level volume. Default: ON, Sedang.
 */
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Volume = "low" | "medium" | "high";

interface CashierSettingsState {
  soundEnabled: boolean;
  volume: Volume;
  setSoundEnabled: (v: boolean) => void;
  setVolume: (v: Volume) => void;
}

export const useCashierSettingsStore = create<CashierSettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      volume: "medium",
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setVolume: (v) => set({ volume: v }),
    }),
    { name: "majamu-cashier-settings" }
  )
);
