/**
 * Notifikasi suara pesanan baru (Web Audio API, tanpa file aset).
 * Mengembalikan true bila berhasil diputar; false bila diblokir browser
 * (audio fallback → sistem tetap berjalan, hanya visual).
 */
"use client";

import type { Volume } from "@/stores/cashier-settings-store";

const GAIN: Record<Volume, number> = { low: 0.12, medium: 0.35, high: 0.7 };

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as AudioWindow;
  const AC = window.AudioContext || w.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

export function playNewOrderSound(volume: Volume = "medium"): boolean {
  try {
    const ac = getCtx();
    if (!ac) return false;
    if (ac.state === "suspended") void ac.resume();

    const now = ac.currentTime;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(GAIN[volume], now);
    gain.connect(ac.destination);

    // Dua nada lembut (ding-dong).
    const tone = (freq: number, start: number, dur: number) => {
      const osc = ac.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + start);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, now + start);
      g.gain.exponentialRampToValueAtTime(GAIN[volume], now + start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(now + start);
      osc.stop(now + start + dur);
    };
    tone(880, 0, 0.18);
    tone(1175, 0.18, 0.22);
    return true;
  } catch {
    return false;
  }
}
