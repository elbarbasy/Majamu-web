"use client";

import { ArrowRight, FlaskConical, Sparkles } from "lucide-react";

import { useUiStore } from "@/stores/ui-store";

/**
 * Card Quiz Rekomendasi — premium, compact, seimbang.
 * Membuka quiz full-screen sheet (logika lama dipertahankan: ui-store.openQuiz).
 */
export function QuizRecommendationCard() {
  const openQuiz = useUiStore((s) => s.openQuiz);

  return (
    <div className="px-4 py-2">
      <button
        onClick={openQuiz}
        className="group relative flex w-full items-center gap-4 overflow-hidden rounded-card border border-line bg-surface p-4 text-left shadow-soft transition-transform active:scale-[0.99]"
      >
        {/* aksen latar */}
        <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-accent/10" />
        <span className="pointer-events-none absolute -right-2 bottom-[-2rem] h-20 w-20 rounded-full bg-primary/5" />

        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <FlaskConical className="h-7 w-7" />
        </span>

        <span className="relative min-w-0 flex-1">
          <span className="flex items-center gap-1 text-[13px] font-bold text-primary">
            Temukan jamu yang pas
            <Sparkles className="h-3.5 w-3.5 text-accent" />
          </span>
          <span className="clamp-2 mt-0.5 block text-xs leading-relaxed text-muted">
            Jawab 4 pertanyaan singkat, kami rekomendasikan ramuan paling cocok untukmu.
          </span>
        </span>

        <span className="relative inline-flex shrink-0 items-center gap-1 rounded-btn bg-accent px-3 py-2 text-xs font-bold text-accent-foreground transition-transform group-hover:translate-x-0.5">
          Mulai Quiz
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </button>
    </div>
  );
}
