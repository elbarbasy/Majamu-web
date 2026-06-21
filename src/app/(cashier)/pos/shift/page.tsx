"use client";

import * as React from "react";
import { Wallet } from "lucide-react";

import { ShiftNoteForm } from "@/components/cashier/shift-note-form";
import { shiftCategoryLabel } from "@/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { fetchShiftNotes } from "@/services/cashier.service";
import type { ShiftNote } from "@/types";

/** Catatan Shift (CASHIER_UI.md). Form input + daftar catatan terbaru. */
export default function ShiftPage() {
  const [notes, setNotes] = React.useState<ShiftNote[]>([]);
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(() => {
    fetchShiftNotes().then((data) => {
      setNotes(data);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold text-primary">Catatan Shift</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ShiftNoteForm onCreated={reload} />

        <div className="rounded-card bg-surface p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-black/80">
            Catatan Terbaru
          </h2>
          {loading ? (
            <p className="py-6 text-center text-sm text-black/50">Memuat…</p>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Wallet className="h-10 w-10 text-secondary" />
              <p className="text-sm text-black/55">Belum ada catatan shift.</p>
            </div>
          ) : (
            <ul className="divide-y divide-black/5">
              {notes.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-black/80">
                      {shiftCategoryLabel(n.category)}
                    </p>
                    {n.description && (
                      <p className="text-xs text-black/55">{n.description}</p>
                    )}
                    <p className="text-xs text-black/40">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                  {n.nominal != null && (
                    <span className="shrink-0 text-sm font-bold text-primary">
                      {formatCurrency(n.nominal)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
