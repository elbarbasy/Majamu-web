"use client";

import * as React from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/owner/page-header";
import { SectionCard } from "@/components/owner/section-card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  deleteFilterChip,
  listFilterChips,
  upsertFilterChip,
} from "@/services/owner.service";
import type { FilterChipItem } from "@/lib/owner-store";

export default function FilterChipsPage() {
  const [chips, setChips] = React.useState<FilterChipItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FilterChipItem | null>(null);
  const [name, setName] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState(0);

  const reload = React.useCallback(() => {
    listFilterChips().then(setChips);
  }, []);
  React.useEffect(() => reload(), [reload]);

  function openCreate() {
    setEditing(null);
    setName("");
    setSortOrder(chips.length + 1);
    setOpen(true);
  }
  function openEdit(c: FilterChipItem) {
    setEditing(c);
    setName(c.name);
    setSortOrder(c.sortOrder);
    setOpen(true);
  }
  async function save() {
    if (!name.trim()) return;
    await upsertFilterChip({ id: editing?.id, name: name.trim(), sortOrder });
    setOpen(false);
    reload();
  }
  async function remove(id: string) {
    setChips((prev) => prev.filter((c) => c.id !== id));
    await deleteFilterChip(id);
  }

  return (
    <div>
      <PageHeader
        title="Filter Quiz"
        description="Kelola kategori/filter yang dipakai pelanggan & quiz rekomendasi."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Tambah Filter
          </Button>
        }
      />

      <SectionCard>
        <ul className="divide-y divide-black/5">
          {chips.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-3">
              <GripVertical className="h-4 w-4 text-black/25" />
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-bold text-primary">
                {c.sortOrder}
              </span>
              <span className="flex-1 font-medium text-black/80">{c.name}</span>
              <button
                onClick={() => openEdit(c)}
                aria-label="Edit"
                className="flex h-8 w-8 items-center justify-center rounded-full text-black/50 hover:bg-primary/10 hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(c.id)}
                aria-label="Hapus"
                className="flex h-8 w-8 items-center justify-center rounded-full text-black/50 hover:bg-error/10 hover:text-error"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {chips.length === 0 && (
            <p className="py-8 text-center text-sm text-black/50">
              Belum ada filter.
            </p>
          )}
        </ul>
      </SectionCard>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Filter" : "Tambah Filter"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={save}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-black/80">
              Nama Filter
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="mis. Daya Tahan Tubuh"
              className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-black/80">
              Urutan
            </label>
            <input
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(Number(e.target.value.replace(/[^0-9]/g, "")))
              }
              inputMode="numeric"
              className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
