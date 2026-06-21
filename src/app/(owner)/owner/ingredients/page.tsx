"use client";

import * as React from "react";
import { Leaf, Pencil, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/owner/page-header";
import { SectionCard } from "@/components/owner/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  deleteIngredient,
  listIngredients,
  upsertIngredient,
} from "@/services/owner.service";
import type { IngredientItem } from "@/lib/owner-store";

export default function IngredientsPage() {
  const [items, setItems] = React.useState<IngredientItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<IngredientItem | null>(null);
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");

  const reload = React.useCallback(() => {
    listIngredients().then(setItems);
  }, []);
  React.useEffect(() => reload(), [reload]);

  function openCreate() {
    setEditing(null);
    setName("");
    setCategory("");
    setOpen(true);
  }
  function openEdit(i: IngredientItem) {
    setEditing(i);
    setName(i.name);
    setCategory(i.category);
    setOpen(true);
  }
  async function save() {
    if (!name.trim()) return;
    await upsertIngredient({ id: editing?.id, name: name.trim(), category });
    setOpen(false);
    reload();
  }
  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteIngredient(id);
  }

  return (
    <div>
      <PageHeader
        title="Ingredients"
        description="Kelola bahan/komposisi jamu yang dipakai pada produk."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Tambah Bahan
          </Button>
        }
      />

      <SectionCard>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between rounded-card border border-black/10 p-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Leaf className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-black/85">{i.name}</p>
                  {i.category && (
                    <Badge variant="secondary">{i.category}</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(i)}
                  aria-label="Edit"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-black/50 hover:bg-primary/10 hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(i.id)}
                  aria-label="Hapus"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-black/50 hover:bg-error/10 hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-black/50">
              Belum ada bahan.
            </p>
          )}
        </div>
      </SectionCard>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Bahan" : "Tambah Bahan"}
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
              Nama Bahan
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="mis. Jahe Merah"
              className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-black/80">
              Kategori
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="mis. rimpang, rempah, pemanis"
              className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
