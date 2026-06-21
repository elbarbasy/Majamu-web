"use client";

import { ProductDetailSheet } from "@/components/customer/product-detail-sheet";
import { QuizSheet } from "@/components/customer/quiz-sheet";
import { SearchSheet } from "@/components/customer/search-sheet";
import { SideDrawer } from "@/components/customer/side-drawer";

/**
 * Kumpulan overlay Customer yang dirender sekali di layout agar dapat dibuka
 * dari mana saja (header, product card, quiz card) via uiStore.
 */
export function CustomerOverlays() {
  return (
    <>
      <SideDrawer />
      <SearchSheet />
      <QuizSheet />
      <ProductDetailSheet />
    </>
  );
}
