"use client";

import * as React from "react";

import { unlockAudio } from "@/lib/sound";

/**
 * Komponen invisible yang meng-unlock Web Audio pada interaksi pengguna pertama.
 * Browser memblokir autoplay audio sampai ada gesture (klik/tap/keydown).
 * Setelah unlock, suara notifikasi pesanan baru bisa berbunyi.
 */
export function AudioUnlocker() {
  React.useEffect(() => {
    function handler() {
      unlockAudio();
      // Sekali saja.
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("keydown", handler);
    }
    document.addEventListener("click", handler, { once: true });
    document.addEventListener("touchstart", handler, { once: true });
    document.addEventListener("keydown", handler, { once: true });
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("keydown", handler);
    };
  }, []);

  return null;
}
