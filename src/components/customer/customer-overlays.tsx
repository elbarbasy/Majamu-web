"use client";

import { InfoPanel } from "@/components/customer/info-panel";
import { ProductDetailSheet } from "@/components/customer/product-detail-sheet";
import { QuizSheet } from "@/components/customer/quiz-sheet";
import { SearchSheet } from "@/components/customer/search-sheet";

/**
 * Kumpulan overlay Customer yang dirender sekali di layout agar dapat dibuka
 * dari mana saja (header, product card, quiz card) via uiStore.
 */
export function CustomerOverlays() {
  return (
    <>
      <InfoPanel />
      <SearchSheet />
      <QuizSheet />
      <ProductDetailSheet />
    </>
  );
}
