"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { setTableContext } from "@/lib/table-context";
import { lookupTable } from "@/services/tables.service";

type State = "checking" | "invalid";

/**
 * Entry QR (/table/[tableNumber]). Sistem mengenali nomor meja, memvalidasi
 * ke tabel `tables`, menyimpan konteks dine-in, lalu mengarahkan ke menu
 * (PRD/USER_FLOW). Bila meja tidak valid/nonaktif, tampilkan info.
 */
export default function TableEntryPage() {
  const params = useParams<{ tableNumber: string }>();
  const router = useRouter();
  const [state, setState] = React.useState<State>("checking");

  React.useEffect(() => {
    const parsed = Number(params?.tableNumber);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setState("invalid");
      return;
    }
    let alive = true;
    lookupTable(parsed).then((res) => {
      if (!alive) return;
      if (!res.found || !res.active) {
        setState("invalid");
        return;
      }
      setTableContext(parsed);
      router.replace("/");
    });
    return () => {
      alive = false;
    };
  }, [params, router]);

  if (state === "invalid") {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertTriangle className="h-12 w-12 text-warning" />
        <h1 className="text-lg font-bold text-primary">Meja tidak tersedia</h1>
        <p className="text-sm text-black/55">
          QR meja ini tidak ditemukan atau sedang nonaktif. Silakan hubungi
          kasir.
        </p>
        <Link href="/" className="mt-1">
          <Button variant="outline">Lihat Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-black/60">Menyiapkan menu untuk meja Anda…</p>
    </div>
  );
}
