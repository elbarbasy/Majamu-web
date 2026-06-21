"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Leaf } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Banner } from "@/types";

interface HeroCarouselProps {
  banners: Banner[];
}

const GRADIENTS = [
  "from-primary via-primary to-[#6F4A28]",
  "from-accent via-[#6E9A58] to-[#4F7A3E]",
  "from-secondary via-[#C9A06C] to-primary",
];

/**
 * Hero banner carousel — 1 slide terlihat penuh, auto-slide 4 detik,
 * tinggi 220px (mobile), radius 24, dots + tombol swipe kiri/kanan.
 * Tidak menampilkan sebagian slide berikutnya (overflow-hidden + translateX).
 */
export function HeroCarousel({ banners }: HeroCarouselProps) {
  const slides = banners.length > 0 ? banners : [];
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  const count = slides.length;

  React.useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 4000);
    return () => clearInterval(id);
  }, [count, paused]);

  if (count === 0) return null;

  const go = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <section className="px-4 pt-3">
      <div
        className="relative h-[220px] w-full overflow-hidden rounded-card shadow-soft"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        {/* Track */}
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((b, i) => (
            <div key={b.id} className="relative h-full w-full shrink-0">
              {b.imageUrl ? (
                <Image
                  src={b.imageUrl}
                  alt={b.title ?? "Promo"}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 600px"
                />
              ) : (
                <div
                  className={cn(
                    "h-full w-full bg-gradient-to-br",
                    GRADIENTS[i % GRADIENTS.length]
                  )}
                />
              )}
              {/* Overlay konten */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  <Leaf className="h-3 w-3" /> Jamu Modern
                </span>
                <h2 className="clamp-2 text-lg font-extrabold leading-snug text-white drop-shadow">
                  {b.title ?? "Sehat alami setiap hari"}
                </h2>
              </div>
            </div>
          ))}
        </div>

        {/* Tombol swipe */}
        {count > 1 && (
          <>
            <button
              onClick={() => go(index - 1)}
              aria-label="Sebelumnya"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary shadow-soft-sm backdrop-blur transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Berikutnya"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary shadow-soft-sm backdrop-blur transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dots */}
        {count > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/55"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
