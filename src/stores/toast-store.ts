/**
 * toastStore — notifikasi ringan untuk Cashier (status update + order baru).
 * Tidak dipersist. Mendukung aksi (mis. Undo) dengan durasi kustom.
 */
"use client";

import { create } from "zustand";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  tone?: "success" | "info" | "new";
  durationMs?: number;
  action?: ToastAction;
}

interface ToastState {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = `t-${Date.now()}-${counter++}`;
    const duration = t.durationMs ?? 4000;
    set((s) => ({ toasts: [...s.toasts, { id, durationMs: duration, ...t }] }));
    if (duration > 0) {
      setTimeout(() => get().dismiss(id), duration);
    }
    return id;
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));
