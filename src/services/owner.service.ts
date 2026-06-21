/**
 * owner.service — operasi modul Owner.
 *
 * Implementasi saat ini memakai owner-store (in-memory, disemai sample-data)
 * agar seluruh halaman Owner berfungsi penuh tanpa Supabase. Untuk produksi,
 * ganti isi fungsi dengan query Supabase (pola sama seperti products/cashier
 * service). API fungsi sengaja async agar mudah ditukar.
 */
"use client";

import {
  nextId,
  ownerDb,
  type ActivityLogItem,
  type BannerItem,
  type CashEntryItem,
  type CashierItem,
  type FilterChipItem,
  type IngredientItem,
  type OwnerProduct,
  type StoreSettingsData,
  type TableItem,
} from "@/lib/owner-store";

function ok<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function todayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/* ---------------- Dashboard ---------------- */

export interface DashboardSummary {
  omzetToday: number;
  ordersToday: number;
  activeOrders: number;
  topProduct: { name: string; qty: number } | null;
  outOfStock: { id: string; name: string }[];
  storeStatus: "open" | "closed";
  activeCashiers: number;
}

export async function getDashboard(): Promise<DashboardSummary> {
  const db = ownerDb();
  // Tanpa DB, omzet/pesanan hari ini diturunkan dari kas pemasukan hari ini
  // + estimasi sederhana, agar dashboard tetap informatif untuk UMKM.
  const today = todayKey(new Date());
  const incomeToday = db.cashEntries
    .filter((c) => c.type === "income" && c.createdAt.slice(0, 10) === today)
    .reduce((s, c) => s + c.amount, 0);
  const outOfStock = db.products
    .filter((p) => p.stockStatus === "out_of_stock")
    .map((p) => ({ id: p.id, name: p.name }));
  const popular = db.products.find((p) => p.isPopular);
  return ok({
    omzetToday: incomeToday || 250000,
    ordersToday: 12,
    activeOrders: 3,
    topProduct: popular ? { name: popular.name, qty: 8 } : null,
    outOfStock,
    storeStatus: db.settings.storeStatus,
    activeCashiers: db.cashiers.filter((c) => c.isActive).length,
  });
}

/* ---------------- Reports ---------------- */

export type ReportRange = "daily" | "weekly" | "monthly";

export interface ReportData {
  range: ReportRange;
  totalSales: number;
  orderCount: number;
  byPayment: { method: string; total: number }[];
  topProducts: { name: string; qty: number; total: number }[];
  series: { label: string; total: number }[];
}

export async function getReport(range: ReportRange): Promise<ReportData> {
  const db = ownerDb();
  const base = db.products.slice(0, 5);
  const topProducts = base.map((p, i) => ({
    name: p.name,
    qty: 20 - i * 3,
    total: (20 - i * 3) * p.price,
  }));
  const totalSales = topProducts.reduce((s, t) => s + t.total, 0);
  const orderCount =
    range === "daily" ? 12 : range === "weekly" ? 78 : 320;

  const labels =
    range === "daily"
      ? ["08", "10", "12", "14", "16", "18", "20"]
      : range === "weekly"
        ? ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
        : ["W1", "W2", "W3", "W4"];
  const series = labels.map((label, i) => ({
    label,
    total: Math.round((totalSales / labels.length) * (0.6 + ((i % 3) + 1) * 0.2)),
  }));

  return ok({
    range,
    totalSales,
    orderCount,
    byPayment: [
      { method: "Tunai", total: Math.round(totalSales * 0.5) },
      { method: "QRIS", total: Math.round(totalSales * 0.35) },
      { method: "Midtrans", total: Math.round(totalSales * 0.15) },
    ],
    topProducts,
    series,
  });
}

/* ---------------- Cash (Kas) ---------------- */

export async function listCashEntries(): Promise<CashEntryItem[]> {
  return ok(
    [...ownerDb().cashEntries].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    )
  );
}

export async function createCashEntry(input: {
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
}): Promise<CashEntryItem> {
  const entry: CashEntryItem = {
    id: nextId("cash"),
    type: input.type,
    category: input.category,
    amount: input.amount,
    description: input.description,
    createdAt: new Date().toISOString(),
  };
  ownerDb().cashEntries.push(entry);
  return ok(entry);
}

export async function deleteCashEntry(id: string): Promise<boolean> {
  const db = ownerDb();
  db.cashEntries = db.cashEntries.filter((c) => c.id !== id);
  return ok(true);
}

/* ---------------- Products ---------------- */

export async function listProducts(): Promise<OwnerProduct[]> {
  return ok([...ownerDb().products]);
}

export async function upsertProduct(
  input: Omit<OwnerProduct, "id"> & { id?: string }
): Promise<OwnerProduct> {
  const db = ownerDb();
  if (input.id) {
    const idx = db.products.findIndex((p) => p.id === input.id);
    if (idx >= 0) {
      db.products[idx] = { ...db.products[idx], ...input, id: input.id };
      return ok(db.products[idx]);
    }
  }
  const created: OwnerProduct = { ...input, id: nextId("prod") };
  db.products.push(created);
  return ok(created);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = ownerDb();
  db.products = db.products.filter((p) => p.id !== id);
  return ok(true);
}

export async function setProductStock(
  id: string,
  status: "available" | "out_of_stock"
): Promise<boolean> {
  const p = ownerDb().products.find((x) => x.id === id);
  if (p) p.stockStatus = status;
  return ok(true);
}

export async function setProductPopular(
  id: string,
  isPopular: boolean
): Promise<boolean> {
  const p = ownerDb().products.find((x) => x.id === id);
  if (p) {
    p.isPopular = isPopular;
    const has = p.filterChips.includes("Rekomendasi");
    if (isPopular && !has) p.filterChips = [...p.filterChips, "Rekomendasi"];
    if (!isPopular && has)
      p.filterChips = p.filterChips.filter((c) => c !== "Rekomendasi");
  }
  return ok(true);
}

/* ---------------- Filter Chips ---------------- */

export async function listFilterChips(): Promise<FilterChipItem[]> {
  return ok([...ownerDb().chips].sort((a, b) => a.sortOrder - b.sortOrder));
}

export async function upsertFilterChip(input: {
  id?: string;
  name: string;
  sortOrder: number;
}): Promise<FilterChipItem> {
  const db = ownerDb();
  if (input.id) {
    const c = db.chips.find((x) => x.id === input.id);
    if (c) {
      c.name = input.name;
      c.sortOrder = input.sortOrder;
      return ok(c);
    }
  }
  const created: FilterChipItem = { id: nextId("chip"), ...input };
  db.chips.push(created);
  return ok(created);
}

export async function deleteFilterChip(id: string): Promise<boolean> {
  const db = ownerDb();
  db.chips = db.chips.filter((c) => c.id !== id);
  return ok(true);
}

/* ---------------- Ingredients ---------------- */

export async function listIngredients(): Promise<IngredientItem[]> {
  return ok([...ownerDb().ingredients]);
}

export async function upsertIngredient(input: {
  id?: string;
  name: string;
  category: string;
}): Promise<IngredientItem> {
  const db = ownerDb();
  if (input.id) {
    const it = db.ingredients.find((x) => x.id === input.id);
    if (it) {
      it.name = input.name;
      it.category = input.category;
      return ok(it);
    }
  }
  const created: IngredientItem = { id: nextId("ing"), ...input };
  db.ingredients.push(created);
  return ok(created);
}

export async function deleteIngredient(id: string): Promise<boolean> {
  const db = ownerDb();
  db.ingredients = db.ingredients.filter((i) => i.id !== id);
  return ok(true);
}

/* ---------------- Banners ---------------- */

export async function listBanners(): Promise<BannerItem[]> {
  return ok([...ownerDb().banners]);
}

export async function upsertBanner(input: {
  id?: string;
  title: string;
  imageUrl: string | null;
  isActive: boolean;
}): Promise<BannerItem> {
  const db = ownerDb();
  if (input.id) {
    const b = db.banners.find((x) => x.id === input.id);
    if (b) {
      Object.assign(b, input);
      return ok(b);
    }
  }
  const created: BannerItem = { id: nextId("ban"), ...input };
  db.banners.push(created);
  return ok(created);
}

export async function deleteBanner(id: string): Promise<boolean> {
  const db = ownerDb();
  db.banners = db.banners.filter((b) => b.id !== id);
  return ok(true);
}

/* ---------------- Tables (QR) ---------------- */

export async function listTables(): Promise<TableItem[]> {
  return ok([...ownerDb().tables].sort((a, b) => a.tableNumber - b.tableNumber));
}

export async function upsertTable(input: {
  id?: string;
  tableNumber: number;
  isActive: boolean;
}): Promise<TableItem> {
  const db = ownerDb();
  if (input.id) {
    const t = db.tables.find((x) => x.id === input.id);
    if (t) {
      t.tableNumber = input.tableNumber;
      t.isActive = input.isActive;
      return ok(t);
    }
  }
  const created: TableItem = { id: nextId("tbl"), ...input };
  db.tables.push(created);
  return ok(created);
}

export async function deleteTable(id: string): Promise<boolean> {
  const db = ownerDb();
  db.tables = db.tables.filter((t) => t.id !== id);
  return ok(true);
}

/* ---------------- Cashiers ---------------- */

export async function listCashiers(): Promise<CashierItem[]> {
  return ok([...ownerDb().cashiers]);
}

export async function upsertCashier(input: {
  id?: string;
  name: string;
  email: string;
  isActive: boolean;
}): Promise<CashierItem> {
  const db = ownerDb();
  if (input.id) {
    const c = db.cashiers.find((x) => x.id === input.id);
    if (c) {
      Object.assign(c, input);
      return ok(c);
    }
  }
  const created: CashierItem = { id: nextId("usr"), ...input };
  db.cashiers.push(created);
  return ok(created);
}

export async function setCashierActive(
  id: string,
  isActive: boolean
): Promise<boolean> {
  const c = ownerDb().cashiers.find((x) => x.id === id);
  if (c) c.isActive = isActive;
  return ok(true);
}

export async function listActivityLogs(): Promise<ActivityLogItem[]> {
  return ok(
    [...ownerDb().activityLogs].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    )
  );
}

/* ---------------- Settings ---------------- */

export async function getStoreSettings(): Promise<StoreSettingsData> {
  return ok({ ...ownerDb().settings });
}

export async function updateStoreSettings(
  patch: Partial<StoreSettingsData>
): Promise<StoreSettingsData> {
  const db = ownerDb();
  db.settings = { ...db.settings, ...patch };
  return ok({ ...db.settings });
}
