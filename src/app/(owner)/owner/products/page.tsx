"use client";

import * as React from "react";
import { Pencil, Plus, Search, Star, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/owner/page-header";
import { SectionCard } from "@/components/owner/section-card";
import { ImageUpload } from "@/components/owner/image-upload";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn, formatCurrency } from "@/lib/utils";
import {
  deleteProduct,
  listFilterChips,
  listIngredients,
  listProducts,
  setProductPopular,
  setProductStock,
  upsertProduct,
} from "@/services/owner.service";
import type { OwnerProduct } from "@/lib/owner-store";

const EMPTY: Omit<OwnerProduct, "id"> = {
  name: "",
  price: 0,
  description: "",
  photoUrl: null,
  stockStatus: "available",
  filterChips: [],
  ingredients: [],
  isPopular: false,
  temperatureEnabled: false,
  sweetnessEnabled: true,
};

export default function ProductsPage() {
  const [products, setProducts] = React.useState<OwnerProduct[]>([]);
  const [chips, setChips] = React.useState<string[]>([]);
  const [allIngredients, setAllIngredients] = React.useState<string[]>([]);
  const [query, setQuery] = React.useState("");
  const [chipFilter, setChipFilter] = React.useState("Semua");
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 8;

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<OwnerProduct | null>(null);
  const [form, setForm] = React.useState<Omit<OwnerProduct, "id">>(EMPTY);

  const reload = React.useCallback(() => {
    listProducts().then(setProducts);
  }, []);

  React.useEffect(() => {
    reload();
    listFilterChips().then((c) => setChips(c.map((x) => x.name)));
    listIngredients().then((i) => setAllIngredients(i.map((x) => x.name)));
  }, [reload]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }
  function openEdit(p: OwnerProduct) {
    setEditing(p);
    const { id: _id, ...rest } = p;
    void _id;
    setForm(rest);
    setOpen(true);
  }

  async function save() {
    if (!form.name || form.price <= 0) return;
    await upsertProduct({ ...form, id: editing?.id });
    setOpen(false);
    reload();
  }

  async function remove(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await deleteProduct(id);
  }

  async function toggleStock(p: OwnerProduct) {
    const next = p.stockStatus === "available" ? "out_of_stock" : "available";
    setProducts((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, stockStatus: next } : x))
    );
    await setProductStock(p.id, next);
  }

  async function togglePopular(p: OwnerProduct) {
    const next = !p.isPopular;
    setProducts((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, isPopular: next } : x))
    );
    await setProductPopular(p.id, next);
  }

  function toggleInArray(list: string[], value: string): string[] {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }

  const filtered = products.filter((p) => {
    const matchQuery = p.name
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchChip =
      chipFilter === "Semua" || p.filterChips.includes(chipFilter);
    return matchQuery && matchChip;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset ke halaman 1 saat filter/pencarian berubah.
  React.useEffect(() => {
    setPage(1);
  }, [query, chipFilter]);

  return (
    <div>
      <PageHeader
        title="Kelola Produk"
        description="Atur menu jamu, harga, stok, dan produk populer."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Button>
        }
      />

      <SectionCard>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-btn border border-black/15 px-3">
            <Search className="h-4 w-4 text-black/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk…"
              className="h-10 w-full bg-transparent text-sm outline-none"
            />
          </div>
          <select
            value={chipFilter}
            onChange={(e) => setChipFilter(e.target.value)}
            className="h-10 rounded-btn border border-black/15 bg-surface px-3 text-sm outline-none focus:border-primary sm:w-56"
          >
            <option value="Semua">Semua Filter</option>
            {chips.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-black/45">
                <th className="pb-2 font-semibold">Produk</th>
                <th className="pb-2 text-right font-semibold">Harga</th>
                <th className="pb-2 text-center font-semibold">Populer</th>
                <th className="pb-2 text-center font-semibold">Tersedia</th>
                <th className="pb-2 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {paged.map((p) => (
                <tr key={p.id}>
                  <td className="py-3">
                    <p className="font-semibold text-black/85">{p.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.filterChips.slice(0, 3).map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-secondary/30 px-2 py-0.5 text-[11px] text-secondary-foreground"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-right font-medium text-primary">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="py-3">
                    <div className="flex justify-center">
                      <button
                        onClick={() => togglePopular(p)}
                        aria-label="Toggle populer"
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full",
                          p.isPopular
                            ? "bg-accent/15 text-accent"
                            : "text-black/30 hover:bg-black/5"
                        )}
                      >
                        <Star
                          className="h-4 w-4"
                          fill={p.isPopular ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-center">
                      <Switch
                        checked={p.stockStatus === "available"}
                        onChange={() => toggleStock(p)}
                      />
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        aria-label="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-black/50 hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        aria-label="Hapus"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-black/50 hover:bg-error/10 hover:text-error"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-black/50">
              Tidak ada produk.
            </p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
            <span className="text-xs text-black/50">
              Menampilkan {paged.length} dari {filtered.length} produk
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded-btn border border-black/15 px-3 py-1.5 text-sm font-medium text-black/70 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="px-2 text-sm font-semibold text-black/70">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-btn border border-black/15 px-3 py-1.5 text-sm font-medium text-black/70 disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title={editing ? "Edit Produk" : "Tambah Produk"}
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
          <ImageUpload
            label="Foto Produk"
            bucket="products"
            aspect="aspect-square"
            value={form.photoUrl}
            onChange={(url) => setForm({ ...form, photoUrl: url })}
            hint="Unggah dari perangkat (maks 5MB). Tidak menerima link."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-black/80">
                Nama Produk
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-black/80">
                Harga (Rp)
              </label>
              <input
                value={form.price || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: Number(e.target.value.replace(/[^0-9]/g, "")),
                  })
                }
                inputMode="numeric"
                className="h-11 w-full rounded-card border border-black/15 px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-black/80">
              Deskripsi
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              className="w-full resize-none rounded-card border border-black/15 p-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-black/80">
              Filter / Manfaat
            </p>
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      filterChips: toggleInArray(form.filterChips, c),
                    })
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium",
                    form.filterChips.includes(c)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-black/15 text-black/60"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-black/80">Komposisi</p>
            <div className="flex flex-wrap gap-2">
              {allIngredients.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      ingredients: toggleInArray(form.ingredients, i),
                    })
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium",
                    form.ingredients.includes(i)
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-black/15 text-black/60"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-card bg-background p-3">
            <span className="text-sm font-semibold text-black/80">
              Produk Populer
            </span>
            <Switch
              checked={form.isPopular}
              onChange={(v) => setForm({ ...form, isPopular: v })}
            />
          </div>
          <div className="flex items-center justify-between rounded-card bg-background p-3">
            <div>
              <span className="block text-sm font-semibold text-black/80">
                Opsi Suhu (Hot/Ice)
              </span>
              <span className="block text-xs text-black/45">
                Tampilkan pilihan suhu ke pelanggan
              </span>
            </div>
            <Switch
              checked={form.temperatureEnabled}
              onChange={(v) => setForm({ ...form, temperatureEnabled: v })}
            />
          </div>
          <div className="flex items-center justify-between rounded-card bg-background p-3">
            <div>
              <span className="block text-sm font-semibold text-black/80">
                Opsi Tingkat Manis
              </span>
              <span className="block text-xs text-black/45">
                Tampilkan pilihan kemanisan ke pelanggan
              </span>
            </div>
            <Switch
              checked={form.sweetnessEnabled}
              onChange={(v) => setForm({ ...form, sweetnessEnabled: v })}
            />
          </div>
          <div className="flex items-center justify-between rounded-card bg-background p-3">
            <span className="text-sm font-semibold text-black/80">Tersedia</span>
            <Switch
              checked={form.stockStatus === "available"}
              onChange={(v) =>
                setForm({
                  ...form,
                  stockStatus: v ? "available" : "out_of_stock",
                })
              }
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
