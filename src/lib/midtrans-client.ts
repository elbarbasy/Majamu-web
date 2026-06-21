/**
 * Midtrans Snap (CLIENT). Memuat snap.js & membuka popup pembayaran.
 * Env publik:
 *   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
 *   NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION ("true" untuk produksi)
 */
"use client";

interface SnapCallbacks {
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
}

interface SnapGlobal {
  pay: (token: string, callbacks: SnapCallbacks) => void;
}

declare global {
  interface Window {
    snap?: SnapGlobal;
  }
}

export function midtransClientConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
}

let loading: Promise<void> | null = null;

function loadSnap(): Promise<void> {
  if (typeof window !== "undefined" && window.snap) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise<void>((resolve, reject) => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
    const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
    const src = isProd
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    const script = document.createElement("script");
    script.src = src;
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat Midtrans Snap"));
    document.body.appendChild(script);
  });
  return loading;
}

export type SnapResult = "success" | "pending" | "error" | "close";

/** Buka popup Snap; resolve dengan hasil interaksi pengguna. */
export async function payWithSnap(token: string): Promise<SnapResult> {
  await loadSnap();
  return new Promise<SnapResult>((resolve) => {
    if (!window.snap) return resolve("error");
    window.snap.pay(token, {
      onSuccess: () => resolve("success"),
      onPending: () => resolve("pending"),
      onError: () => resolve("error"),
      onClose: () => resolve("close"),
    });
  });
}
