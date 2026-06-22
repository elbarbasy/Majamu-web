"use client";

import * as React from "react";
import { Leaf } from "lucide-react";

import { getPublicSettings } from "@/services/settings.service";
import { useUiStore } from "@/stores/ui-store";

/**
 * Quiz Card — kartu rekomendasi besar. Latar memakai gambar Quiz dari Owner
 * (settings.quiz_image_url) bila ada; jika kosong → gradient herbal default.
 * Membuka quiz sheet (logika tetap).
 */
export function QuizCard() {
  const openQuiz = useUiStore((s) => s.openQuiz);
  const [image, setImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    getPublicSettings().then((s) => setImage(s.quizImageUrl));
  }, []);

  return (
    <div className="px-4 py-2">
      <div className="relative h-[90px] overflow-hidden rounded-card bg-gradient-to-br from-accent via-[#6E9061] to-[#52764A] shadow-soft">
        {/* Latar gambar (tanpa overlay warna) */}
        {image && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 bg-black/30" />
          </>
        )}

        {/* Ilustrasi ikon (saat tanpa gambar) */}
        {!image && (
          <span className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
        )}

        <div className="relative flex h-full items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Leaf className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-white">
                Bingung Pilih Jamu?
              </h3>
              <p className="text-xs text-white/85">
                Temukan rekomendasi yang cocok.
              </p>
            </div>
          </div>

          <button
            onClick={openQuiz}
            className="shrink-0 whitespace-nowrap rounded-btn bg-white px-4 py-2 text-xs font-bold text-accent shadow-soft-sm transition active:scale-95"
          >
            Mulai Kuis
          </button>
        </div>
      </div>
    </div>
  );
}
