"use client";

import { ArrowRight, Leaf, Sparkles } from "lucide-react";

import { useUiStore } from "@/stores/ui-store";

/**
 * Quiz Card — kartu rekomendasi besar, gradient herbal hijau,
 * ilustrasi di kanan, CTA "Mulai Kuis". Membuka quiz sheet (logika tetap).
 */
export function QuizCard() {
  const openQuiz = useUiStore((s) => s.openQuiz);

  return (
    <div className="px-4 py-2">
      <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-accent via-[#6E9061] to-[#52764A] p-5 shadow-soft">
        {/* Ilustrasi kanan */}
        <span className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-white/10" />
        <span className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 sm:block">
          <Leaf className="h-24 w-24 text-white/20" />
        </span>

        <div className="relative max-w-[78%]">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
              <Leaf className="h-5 w-5" />
            </span>
            <h3 className="text-base font-extrabold text-white">
              Bingung Pilih Jamu?
            </h3>
          </div>
          <p className="clamp-2 text-sm leading-relaxed text-white/90">
            Temukan rekomendasi yang cocok untuk kondisi Anda.
          </p>

          <button
            onClick={openQuiz}
            className="mt-4 inline-flex items-center gap-2 rounded-btn bg-white px-5 py-2.5 text-sm font-bold text-accent shadow-soft-sm transition active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            Mulai Kuis
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
