"use client";
/**
 * Hook untuk konfirmasi hapus (Owner Dashboard).
 * Menyimpan ID target + state open. Dipakai bersama ConfirmDeleteDialog.
 */
"use client";

import * as React from "react";

export function useConfirmDelete() {
  const [target, setTarget] = React.useState<string | null>(null);

  return {
    /** ID yang akan dihapus (null = dialog tertutup). */
    target,
    /** Buka dialog konfirmasi untuk ID tertentu. */
    requestDelete: (id: string) => setTarget(id),
    /** Tutup dialog tanpa hapus. */
    cancel: () => setTarget(null),
    /** Apakah dialog terbuka. */
    open: target !== null,
    /** Panggil setelah hapus berhasil. */
    done: () => setTarget(null),
  };
}
