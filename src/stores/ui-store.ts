/**
 * uiStore — koordinasi overlay Customer (tidak dipersist).
 * Memungkinkan header (di layout) membuka panel info / search,
 * dan product card (di page) membuka bottom sheet detail / quiz.
 */
"use client";

import { create } from "zustand";

interface UiState {
  infoPanelOpen: boolean;
  searchOpen: boolean;
  quizOpen: boolean;
  detailProductId: string | null;

  openInfoPanel: () => void;
  closeInfoPanel: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openQuiz: () => void;
  closeQuiz: () => void;
  openProductDetail: (productId: string) => void;
  closeProductDetail: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  infoPanelOpen: false,
  searchOpen: false,
  quizOpen: false,
  detailProductId: null,

  openInfoPanel: () => set({ infoPanelOpen: true }),
  closeInfoPanel: () => set({ infoPanelOpen: false }),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  openQuiz: () => set({ quizOpen: true }),
  closeQuiz: () => set({ quizOpen: false }),
  openProductDetail: (productId) => set({ detailProductId: productId }),
  closeProductDetail: () => set({ detailProductId: null }),
}));
