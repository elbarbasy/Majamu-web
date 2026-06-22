"use client";

import * as React from "react";
import Image from "next/image";
import { Leaf } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Banner } from "@/types";

interface PromoBannerProps {
  banners: Banner[];
}

const GRADIENTS = [
  "from-primary via-[#6E4632] to-[#4A2F21]",
  "from-accent via-[#6E9061] to-[#52764A]",
  "from-secondary via-[#D2A85F] to-primary",
];

/**
 * Hero banner — 1 slide terlihat penuh, tinggi 180px, radius 24.
 * >1 banner: autoplay 5s + infinite + swipe + dots + pause saat drag.
 * Lebar mengikuti container (px-4), TIDAK memakai 100vw → tidak overflow.
 */
export function PromoBanner({ banners }: PromoBannerProps) {
  const slides = banners ?? [];
  const count = slides.length;
  const [index, setIndex] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const startX = React.useRef<number | null>(null);
  const deltaX = React.useRef(0);

  React.useEffect(() => {
    if (count <= 1 || dragging) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(id);
  }, [count, dragging]);

  if (count === 0) return null;

  const go = (n: number) => setIndex(((n % count) + count) % count);

  function onPointerDown(e: React.PointerEvent) {
    if (count <= 1) return;
    setDragging(true);
    startX.current = e.clientX;
    deltaX.current = 0;
  }
  function onPointerMove(e: React.PointerEvent) {
    if (startX.current === null) return;
    deltaX.current = e.clientX - startX.current;
  }
  function onPointerUp() {
    if (startX.current === null) return;
    const threshold = 48;
    if (deltaX.current > threshold) go(index - 1);
    else if (deltaX.current < -threshold) go(index + 1);
    startX.current = null;
    deltaX.current = 0;
    setDragging(false);
  }

  return (
    <section className="px-4 pt-3">
      <div
        className="relative h-[180px] w-full touch-pan-y overflow-hidden rounded-card shadow-soft"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
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
                  draggable={false}
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <span className="mb-1.5 inline-flex w-fit items-center gap-1 rounded-pill bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  <Leaf className="h-3 w-3" /> Jamu Modern
                </span>
                <h2 className="clamp-2 text-lg font-extrabold leading-snug text-white drop-shadow">
                  {b.title ?? "Sehat alami setiap hari"}
                </h2>
              </div>
            </div>
          ))}
        </div>

        {count > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/55"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
