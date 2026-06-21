"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import type { Banner } from "@/types";

interface PromoBannerProps {
  banners: Banner[];
}

/** Banner Promo (WIREFRAMES.md: Banner Promo). Horizontal snap scroll. */
export function PromoBanner({ banners }: PromoBannerProps) {
  if (!banners.length) return null;

  return (
    <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-3">
      {banners.map((b) => (
        <div
          key={b.id}
          className={cn(
            "relative aspect-[16/7] w-[88%] shrink-0 snap-center overflow-hidden rounded-card",
            "bg-gradient-to-br from-primary to-secondary"
          )}
        >
          {b.imageUrl ? (
            <Image
              src={b.imageUrl}
              alt={b.title ?? "Promo"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 88vw, 560px"
            />
          ) : (
            <div className="flex h-full w-full items-end p-4">
              <span className="text-base font-bold text-white drop-shadow">
                {b.title}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
