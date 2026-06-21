"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import { setTableContext } from "@/lib/table-context";

/**
 * Entry QR (/table/[tableNumber]). Sistem mengenali nomor meja otomatis,
 * menyimpan konteks dine-in, lalu mengarahkan ke homepage menu (PRD/USER_FLOW).
 */
export default function TableEntryPage() {
  const params = useParams<{ tableNumber: string }>();
  const router = useRouter();

  React.useEffect(() => {
    const parsed = Number(params?.tableNumber);
    if (Number.isFinite(parsed) && parsed > 0) {
      setTableContext(parsed);
    }
    router.replace("/");
  }, [params, router]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-black/60">Menyiapkan menu untuk meja Anda…</p>
    </div>
  );
}
