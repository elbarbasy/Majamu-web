"use client";

import { Leaf, Sparkles } from "lucide-react";

import { useUiStore } from "@/stores/ui-store";

/**
 * Card Quiz Rekomendasi (CUSTOMER_UI.md: inline di antara filter dan grid produk).
 * Membuka quiz sebagai full-screen bottom sheet (aturan wajib).
 */
export function QuizCard() {
  const openQuiz = useUiStore((s) => s.openQuiz);

  return (
    <div className="px-4 py-1">
      <button
        onClick={openQuiz}
        className="flex w-full items-center gap-3 rounded-card border border-accent/30 bg-accent/10 p-4 text-left transition-colors hover:bg-accent/15"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
          <Leaf className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-sm font-bold text-primary">
            Bingung pilih jamu?
            <Sparkles className="h-4 w-4 text-accent" />
          </span>
          <span className="block text-xs text-black/60">
            Jawab 4 pertanyaan singkat, kami rekomendasikan yang paling cocok.
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
          Mulai Quiz
        </span>
      </button>
    </div>
  );
}
