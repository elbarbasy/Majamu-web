"use client";
/**
 * useNow — mengembalikan timestamp sekarang yang diperbarui berkala.
 * Dipakai untuk timer "Waktu Tunggu" pada setiap order card (CASHIER_UI.md).
 */
"use client";

import * as React from "react";

export function useNow(intervalMs = 1000): number {
  const [now, setNow] = React.useState<number>(() => Date.now());

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
