/**
 * owner.service — operasi modul Owner.
 *
 * Strategi: SUPABASE-FIRST dengan FALLBACK ke owner-store (in-memory).
 * - Jika Supabase terkonfigurasi (env ada) → baca/tulis ke Supabase nyata.
 * - Jika belum (mode dev/demo) → pakai owner-store yang disemai sample-data.
 *
 * Branch ditentukan oleh ketersediaan client (getClient()). Tipe data selaras
 * dengan schema.sql.
 */
"use client";

import { createClient } from "@/lib/supabase/client";
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

/** Client Supabase atau null bila env belum diset (mode dev). */
function getClient() {
  try {
    return createClient();
  } catch {
    return null;
  }
}

function ok<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/* =========================================================
 * Dashboard (Task #2: metrik nyata dari Supabase + fallback)
 * ========================================================= */

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
  const supabase = getClient();

  if (!supabase) {
    const db = ownerDb();
    const today = new Date().toISOString().slice(0, 10);
    const incomeToday = db.cashEntries
      .filter((c) => c.type === "income" && c.createdAt.slice(0, 10) === today)
      .reduce((s, c) => s + c.amount, 0);
    const popular = db.products.find((p) => p.isPopular);
    return ok({
      omzetToday: incomeToday || 250000,
      ordersToday: 12,
      activeOrders: 3,
      topProduct: popular ? { name: popular.name, qty: 8 } : null,
      outOfStock: db.products
        .filter((p) => p.stockStatus === "out_of_stock")
        .map((p) => ({ id: p.id, name: p.name })),
      storeStatus: db.settings.storeStatus,
      activeCashiers: db.cashiers.filter((c) => c.isActive).length,
    });
  }

  try {
    const todayStart = startOfTodayISO();

    const [ordersTodayRes, activeRes, outRes, settingsRes, cashiersRes] =
      await Promise.all([
        supabase
          .from("orders")
          .select("id, total_price, created_at")
          .gte("created_at", todayStart),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .neq("status", "selesai"),
        supabase
          .from("products")
          .select("id, name")
          .eq("stock_status", "out_of_stock"),
        supabase
          .from("store_settings")
          .select("store_status")
          .limit(1)
          .maybeSingle(),
        supabase
          .from("users")
          .select("id", { count: "exact", head: true })
          .eq("role", "cashier")
          .eq("is_active", true),
      ]);

    const ordersToday = ordersTodayRes.data ?? [];
    const omzetToday = ordersToday.reduce(
      (s, o) => s + (Number(o.total_price) || 0),
      0
    );

    // Produk terlaris hari ini (tally order_items dari order hari ini).
    let topProduct: { name: string; qty: number } | null = null;
    const todayIds = ordersToday.map((o) => o.id);
    if (todayIds.length > 0) {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name_snapshot, quantity, order_id")
        .in("order_id", todayIds);
      const tally = new Map<string, number>();
      (items ?? []).forEach((i) => {
        const name = i.product_name_snapshot ?? "Produk";
        tally.set(name, (tally.get(name) ?? 0) + (i.quantity ?? 0));
      });
      const top = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
      if (top) topProduct = { name: top[0], qty: top[1] };
    }

    return {
      omzetToday,
      ordersToday: ordersToday.length,
      activeOrders: activeRes.count ?? 0,
      topProduct,
      outOfStock: (outRes.data ?? []).map((p) => ({ id: p.id, name: p.name })),
      storeStatus:
        (settingsRes.data?.store_status as "open" | "closed") ?? "open",
      activeCashiers: cashiersRes.count ?? 0,
    };
  } catch (err) {
    console.warn("[owner.service] getDashboard fallback:", err);
    return getDashboardFallback();
  }
}

function getDashboardFallback(): DashboardSummary {
  const db = ownerDb();
  return {
    omzetToday: 250000,
    ordersToday: 12,
    activeOrders: 3,
    topProduct: db.products[0] ? { name: db.products[0].name, qty: 8 } : null,
    outOfStock: db.products
      .filter((p) => p.stockStatus === "out_of_stock")
      .map((p) => ({ id: p.id, name: p.name })),
    storeStatus: db.settings.storeStatus,
    activeCashiers: db.cashiers.filter((c) => c.isActive).length,
  };
}

/* =========================================================
 * Reports (estimasi; agregasi penuh dari Supabase = lanjutan)
 * ========================================================= */

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
  const supabase = getClient();
  if (!supabase) return getReportFallback(range);

  try {
    const now = new Date();
    const start = new Date(now);
    if (range === "daily") start.setHours(0, 0, 0, 0);
    else if (range === "weekly") start.setDate(now.getDate() - 6);
    else start.setDate(now.getDate() - 29);
    if (range !== "daily") start.setHours(0, 0, 0, 0);

    const { data: orders } = await supabase
      .from("orders")
      .select("id, total_price, payment_method, created_at, status")
      .gte("created_at", start.toISOString())
      .neq("status", "menunggu_bayar");

    const rows = orders ?? [];
    const totalSales = rows.reduce((s, o) => s + (Number(o.total_price) || 0), 0);
    const orderCount = rows.length;

    // Breakdown metode pembayaran.
    const payTally = new Map<string, number>();
    rows.forEach((o) => {
      const key = (o.payment_method as string) ?? "cash";
      payTally.set(key, (payTally.get(key) ?? 0) + (Number(o.total_price) || 0));
    });
    const PAY_LABEL: Record<string, string> = {
      cash: "Tunai",
      qris: "QRIS",
      midtrans: "Midtrans",
    };
    const byPayment = ["cash", "qris", "midtrans"].map((m) => ({
      method: PAY_LABEL[m],
      total: payTally.get(m) ?? 0,
    }));

    // Produk terlaris dari order_items.
    let topProducts: ReportData["topProducts"] = [];
    const ids = rows.map((o) => o.id);
    if (ids.length > 0) {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name_snapshot, quantity, subtotal, order_id")
        .in("order_id", ids);
      const tally = new Map<string, { qty: number; total: number }>();
      (items ?? []).forEach((i) => {
        const name = i.product_name_snapshot ?? "Produk";
        const prev = tally.get(name) ?? { qty: 0, total: 0 };
        tally.set(name, {
          qty: prev.qty + (i.quantity ?? 0),
          total: prev.total + (Number(i.subtotal) || 0),
        });
      });
      topProducts = [...tally.entries()]
        .map(([name, v]) => ({ name, qty: v.qty, total: v.total }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);
    }

    const series = buildSeries(
      range,
      rows.map((o) => ({
        createdAt: o.created_at ?? now.toISOString(),
        total: Number(o.total_price) || 0,
      }))
    );

    return { range, totalSales, orderCount, byPayment, topProducts, series };
  } catch (err) {
    console.warn("[owner.service] getReport fallback:", err);
    return getReportFallback(range);
  }
}

const WEEKDAY_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

/** Bangun deret waktu sesuai rentang laporan. */
function buildSeries(
  range: ReportRange,
  orders: { createdAt: string; total: number }[]
): { label: string; total: number }[] {
  if (range === "daily") {
    const labels = ["08", "10", "12", "14", "16", "18", "20"];
    const totals = new Array(labels.length).fill(0);
    orders.forEach((o) => {
      const hour = new Date(o.createdAt).getHours();
      const idx = Math.min(labels.length - 1, Math.max(0, Math.round((hour - 8) / 2)));
      totals[idx] += o.total;
    });
    return labels.map((label, i) => ({ label, total: totals[i] }));
  }

  if (range === "weekly") {
    const days: { label: string; key: string; total: number }[] = [];
    const base = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      days.push({
        label: WEEKDAY_ID[d.getDay()],
        key: d.toISOString().slice(0, 10),
        total: 0,
      });
    }
    orders.forEach((o) => {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      const slot = days.find((d) => d.key === key);
      if (slot) slot.total += o.total;
    });
    return days.map((d) => ({ label: d.label, total: d.total }));
  }

  // monthly → 4 minggu terakhir.
  const labels = ["W1", "W2", "W3", "W4"];
  const totals = new Array(4).fill(0);
  const base = new Date();
  orders.forEach((o) => {
    const diffDays = Math.floor(
      (base.getTime() - new Date(o.createdAt).getTime()) / 86400000
    );
    const weekFromNow = Math.min(3, Math.floor(diffDays / 7));
    totals[3 - weekFromNow] += o.total; // W4 = minggu terbaru
  });
  return labels.map((label, i) => ({ label, total: totals[i] }));
}

function getReportFallback(range: ReportRange): ReportData {
  const db = ownerDb();
  const base = db.products.slice(0, 5);
  const topProducts = base.map((p, i) => ({
    name: p.name,
    qty: 20 - i * 3,
    total: (20 - i * 3) * p.price,
  }));
  const totalSales = topProducts.reduce((s, t) => s + t.total, 0);
  const orderCount = range === "daily" ? 12 : range === "weekly" ? 78 : 320;
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
  return {
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
  };
}

/* =========================================================
 * Cash (Kas)
 * ========================================================= */

export async function listCashEntries(): Promise<CashEntryItem[]> {
  const supabase = getClient();
  if (!supabase) {
    return ok(
      [...ownerDb().cashEntries].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    );
  }
  const { data, error } = await supabase
    .from("cash_entries")
    .select("id, type, category, amount, description, created_at")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((c) => ({
    id: c.id,
    type: (c.type as "income" | "expense") ?? "expense",
    category: c.category ?? "",
    amount: Number(c.amount) || 0,
    description: c.description ?? "",
    createdAt: c.created_at ?? new Date().toISOString(),
  }));
}

export async function createCashEntry(input: {
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
}): Promise<CashEntryItem> {
  const supabase = getClient();
  if (!supabase) {
    const entry: CashEntryItem = {
      id: nextId("cash"),
      ...input,
      createdAt: new Date().toISOString(),
    };
    ownerDb().cashEntries.push(entry);
    return ok(entry);
  }
  const { data } = await supabase
    .from("cash_entries")
    .insert({
      type: input.type,
      category: input.category,
      amount: input.amount,
      description: input.description || null,
    })
    .select("id, created_at")
    .single();
  return {
    id: data?.id ?? nextId("cash"),
    ...input,
    createdAt: data?.created_at ?? new Date().toISOString(),
  };
}

export async function deleteCashEntry(id: string): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) {
    const db = ownerDb();
    db.cashEntries = db.cashEntries.filter((c) => c.id !== id);
    return ok(true);
  }
  await supabase.from("cash_entries").delete().eq("id", id);
  return true;
}

/* =========================================================
 * Products (+ sinkronisasi join chips/ingredients di Supabase)
 * ========================================================= */

type ProductRow = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  stock_status: string | null;
  product_filter_chips: { filter_chips: { name: string } | null }[] | null;
  product_ingredients: { ingredients: { name: string } | null }[] | null;
};

function mapProductRow(row: ProductRow): OwnerProduct {
  const filterChips = (row.product_filter_chips ?? [])
    .map((x) => x.filter_chips?.name)
    .filter((n): n is string => Boolean(n));
  const ingredients = (row.product_ingredients ?? [])
    .map((x) => x.ingredients?.name)
    .filter((n): n is string => Boolean(n));
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price) || 0,
    description: row.description ?? "",
    stockStatus: row.stock_status === "out_of_stock" ? "out_of_stock" : "available",
    filterChips,
    ingredients,
    isPopular: filterChips.includes("Rekomendasi"),
  };
}

export async function listProducts(): Promise<OwnerProduct[]> {
  const supabase = getClient();
  if (!supabase) return ok([...ownerDb().products]);
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, price, description, stock_status,
       product_filter_chips ( filter_chips ( name ) ),
       product_ingredients ( ingredients ( name ) )`
    )
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as unknown as ProductRow[]).map(mapProductRow);
}

/** Map nama->id untuk filter_chips & ingredients (dipakai sinkronisasi join). */
async function nameIdMaps(supabase: NonNullable<ReturnType<typeof getClient>>) {
  const [chipsRes, ingRes] = await Promise.all([
    supabase.from("filter_chips").select("id, name"),
    supabase.from("ingredients").select("id, name"),
  ]);
  const chipMap = new Map<string, string>();
  (chipsRes.data ?? []).forEach((c) => chipMap.set(c.name, c.id));
  const ingMap = new Map<string, string>();
  (ingRes.data ?? []).forEach((i) => ingMap.set(i.name, i.id));
  return { chipMap, ingMap };
}

async function syncProductJoins(
  supabase: NonNullable<ReturnType<typeof getClient>>,
  productId: string,
  filterChips: string[],
  ingredients: string[]
) {
  const { chipMap, ingMap } = await nameIdMaps(supabase);
  await supabase.from("product_filter_chips").delete().eq("product_id", productId);
  await supabase.from("product_ingredients").delete().eq("product_id", productId);

  const chipRows = filterChips
    .map((n) => chipMap.get(n))
    .filter((id): id is string => Boolean(id))
    .map((filter_chip_id) => ({ product_id: productId, filter_chip_id }));
  const ingRows = ingredients
    .map((n) => ingMap.get(n))
    .filter((id): id is string => Boolean(id))
    .map((ingredient_id) => ({ product_id: productId, ingredient_id }));

  if (chipRows.length) await supabase.from("product_filter_chips").insert(chipRows);
  if (ingRows.length) await supabase.from("product_ingredients").insert(ingRows);
}

export async function upsertProduct(
  input: Omit<OwnerProduct, "id"> & { id?: string }
): Promise<OwnerProduct> {
  const supabase = getClient();

  // Pastikan konsistensi flag populer <-> chip "Rekomendasi".
  const chips = new Set(input.filterChips);
  if (input.isPopular) chips.add("Rekomendasi");
  else chips.delete("Rekomendasi");
  const filterChips = [...chips];

  if (!supabase) {
    const db = ownerDb();
    const value: OwnerProduct = {
      ...input,
      filterChips,
      id: input.id ?? nextId("prod"),
    };
    if (input.id) {
      const idx = db.products.findIndex((p) => p.id === input.id);
      if (idx >= 0) db.products[idx] = value;
      else db.products.push(value);
    } else {
      db.products.push(value);
    }
    return ok(value);
  }

  const rowData = {
    name: input.name,
    price: input.price,
    description: input.description || null,
    stock_status: input.stockStatus,
  };

  let productId = input.id ?? "";
  if (input.id) {
    await supabase.from("products").update(rowData).eq("id", input.id);
  } else {
    const { data } = await supabase
      .from("products")
      .insert(rowData)
      .select("id")
      .single();
    productId = data?.id ?? "";
  }
  if (productId) {
    await syncProductJoins(supabase, productId, filterChips, input.ingredients);
  }
  return { ...input, filterChips, id: productId };
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) {
    const db = ownerDb();
    db.products = db.products.filter((p) => p.id !== id);
    return ok(true);
  }
  await supabase.from("products").delete().eq("id", id);
  return true;
}

export async function setProductStock(
  id: string,
  status: "available" | "out_of_stock"
): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) {
    const p = ownerDb().products.find((x) => x.id === id);
    if (p) p.stockStatus = status;
    return ok(true);
  }
  await supabase.from("products").update({ stock_status: status }).eq("id", id);
  return true;
}

export async function setProductPopular(
  id: string,
  isPopular: boolean
): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) {
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
  // Tamb/hapus join ke chip "Rekomendasi".
  const { data: chip } = await supabase
    .from("filter_chips")
    .select("id")
    .eq("name", "Rekomendasi")
    .maybeSingle();
  if (!chip) return true;
  if (isPopular) {
    await supabase
      .from("product_filter_chips")
      .upsert({ product_id: id, filter_chip_id: chip.id });
  } else {
    await supabase
      .from("product_filter_chips")
      .delete()
      .eq("product_id", id)
      .eq("filter_chip_id", chip.id);
  }
  return true;
}

/* =========================================================
 * Filter Chips
 * ========================================================= */

export async function listFilterChips(): Promise<FilterChipItem[]> {
  const supabase = getClient();
  if (!supabase) {
    return ok([...ownerDb().chips].sort((a, b) => a.sortOrder - b.sortOrder));
  }
  const { data, error } = await supabase
    .from("filter_chips")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    sortOrder: c.sort_order ?? 0,
  }));
}

export async function upsertFilterChip(input: {
  id?: string;
  name: string;
  sortOrder: number;
}): Promise<FilterChipItem> {
  const supabase = getClient();
  if (!supabase) {
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
  const row = { name: input.name, sort_order: input.sortOrder };
  if (input.id) {
    await supabase.from("filter_chips").update(row).eq("id", input.id);
    return { id: input.id, ...input };
  }
  const { data } = await supabase
    .from("filter_chips")
    .insert(row)
    .select("id")
    .single();
  return { id: data?.id ?? nextId("chip"), ...input };
}

export async function deleteFilterChip(id: string): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) {
    const db = ownerDb();
    db.chips = db.chips.filter((c) => c.id !== id);
    return ok(true);
  }
  await supabase.from("filter_chips").delete().eq("id", id);
  return true;
}

/* =========================================================
 * Ingredients
 * ========================================================= */

export async function listIngredients(): Promise<IngredientItem[]> {
  const supabase = getClient();
  if (!supabase) return ok([...ownerDb().ingredients]);
  const { data, error } = await supabase
    .from("ingredients")
    .select("id, name, category")
    .order("name", { ascending: true });
  if (error || !data) return [];
  return data.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category ?? "",
  }));
}

export async function upsertIngredient(input: {
  id?: string;
  name: string;
  category: string;
}): Promise<IngredientItem> {
  const supabase = getClient();
  if (!supabase) {
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
  const row = { name: input.name, category: input.category || null };
  if (input.id) {
    await supabase.from("ingredients").update(row).eq("id", input.id);
    return { id: input.id, ...input };
  }
  const { data } = await supabase
    .from("ingredients")
    .insert(row)
    .select("id")
    .single();
  return { id: data?.id ?? nextId("ing"), ...input };
}

export async function deleteIngredient(id: string): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) {
    const db = ownerDb();
    db.ingredients = db.ingredients.filter((i) => i.id !== id);
    return ok(true);
  }
  await supabase.from("ingredients").delete().eq("id", id);
  return true;
}

/* =========================================================
 * Banners
 * ========================================================= */

export async function listBanners(): Promise<BannerItem[]> {
  const supabase = getClient();
  if (!supabase) return ok([...ownerDb().banners]);
  const { data, error } = await supabase
    .from("banners")
    .select("id, title, image_url, is_active");
  if (error || !data) return [];
  return data.map((b) => ({
    id: b.id,
    title: b.title ?? "",
    imageUrl: b.image_url,
    isActive: b.is_active ?? true,
  }));
}

export async function upsertBanner(input: {
  id?: string;
  title: string;
  imageUrl: string | null;
  isActive: boolean;
}): Promise<BannerItem> {
  const supabase = getClient();
  if (!supabase) {
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
  const row = {
    title: input.title,
    image_url: input.imageUrl,
    is_active: input.isActive,
  };
  if (input.id) {
    await supabase.from("banners").update(row).eq("id", input.id);
    return { id: input.id, ...input };
  }
  const { data } = await supabase
    .from("banners")
    .insert(row)
    .select("id")
    .single();
  return { id: data?.id ?? nextId("ban"), ...input };
}

export async function deleteBanner(id: string): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) {
    const db = ownerDb();
    db.banners = db.banners.filter((b) => b.id !== id);
    return ok(true);
  }
  await supabase.from("banners").delete().eq("id", id);
  return true;
}

/* =========================================================
 * Tables (QR)
 * ========================================================= */

export async function listTables(): Promise<TableItem[]> {
  const supabase = getClient();
  if (!supabase) {
    return ok([...ownerDb().tables].sort((a, b) => a.tableNumber - b.tableNumber));
  }
  const { data, error } = await supabase
    .from("tables")
    .select("id, table_number, is_active")
    .order("table_number", { ascending: true });
  if (error || !data) return [];
  return data.map((t) => ({
    id: t.id,
    tableNumber: t.table_number,
    isActive: t.is_active ?? true,
  }));
}

export async function upsertTable(input: {
  id?: string;
  tableNumber: number;
  isActive: boolean;
}): Promise<TableItem> {
  const supabase = getClient();
  if (!supabase) {
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
  const row = { table_number: input.tableNumber, is_active: input.isActive };
  if (input.id) {
    await supabase.from("tables").update(row).eq("id", input.id);
    return { id: input.id, ...input };
  }
  const { data } = await supabase
    .from("tables")
    .insert(row)
    .select("id")
    .single();
  return { id: data?.id ?? nextId("tbl"), ...input };
}

export async function deleteTable(id: string): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) {
    const db = ownerDb();
    db.tables = db.tables.filter((t) => t.id !== id);
    return ok(true);
  }
  await supabase.from("tables").delete().eq("id", id);
  return true;
}

/* =========================================================
 * Cashiers (users role=cashier). Pembuatan akun Auth penuh = lanjutan.
 * ========================================================= */

export async function listCashiers(): Promise<CashierItem[]> {
  const supabase = getClient();
  if (!supabase) return ok([...ownerDb().cashiers]);
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, is_active")
    .eq("role", "cashier")
    .order("name", { ascending: true });
  if (error || !data) return [];
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    isActive: c.is_active ?? true,
  }));
}

export async function upsertCashier(input: {
  id?: string;
  name: string;
  email: string;
  isActive: boolean;
}): Promise<CashierItem> {
  const supabase = getClient();
  if (!supabase) {
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
  if (input.id) {
    await supabase
      .from("users")
      .update({ name: input.name, email: input.email, is_active: input.isActive })
      .eq("id", input.id);
    return { id: input.id, ...input };
  }
  // Catatan: akun Auth (kredensial) dibuat terpisah via Supabase Auth admin.
  const { data } = await supabase
    .from("users")
    .insert({
      name: input.name,
      email: input.email,
      role: "cashier",
      is_active: input.isActive,
    })
    .select("id")
    .single();
  return { id: data?.id ?? nextId("usr"), ...input };
}

export async function setCashierActive(
  id: string,
  isActive: boolean
): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) {
    const c = ownerDb().cashiers.find((x) => x.id === id);
    if (c) c.isActive = isActive;
    return ok(true);
  }
  await supabase.from("users").update({ is_active: isActive }).eq("id", id);
  return true;
}

export async function listActivityLogs(): Promise<ActivityLogItem[]> {
  const supabase = getClient();
  if (!supabase) {
    return ok(
      [...ownerDb().activityLogs].sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1
      )
    );
  }
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id, action, description, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map((l) => ({
    id: l.id,
    action: l.action ?? "",
    description: l.description ?? "",
    createdAt: l.created_at ?? new Date().toISOString(),
  }));
}

/* =========================================================
 * Store Settings
 * ========================================================= */

type SettingsRow = {
  id: string;
  store_name: string | null;
  store_whatsapp: string | null;
  logo_url: string | null;
  operational_hours: StoreSettingsData["operationalHours"] | null;
  payment_methods: string[] | null;
  urgency_threshold_minutes: number | null;
  store_status: string | null;
};

function mapSettings(row: SettingsRow): StoreSettingsData {
  return {
    storeName: row.store_name ?? "Majamu",
    storeWhatsapp: row.store_whatsapp ?? "",
    logoUrl: row.logo_url,
    operationalHours: row.operational_hours ?? {},
    paymentMethods: row.payment_methods ?? ["cash", "qris", "midtrans"],
    urgencyThresholdMinutes: row.urgency_threshold_minutes ?? 7,
    storeStatus: (row.store_status as "open" | "closed") ?? "open",
  };
}

export async function getStoreSettings(): Promise<StoreSettingsData> {
  const supabase = getClient();
  if (!supabase) return ok({ ...ownerDb().settings });
  const { data } = await supabase
    .from("store_settings")
    .select(
      "id, store_name, store_whatsapp, logo_url, operational_hours, payment_methods, urgency_threshold_minutes, store_status"
    )
    .limit(1)
    .maybeSingle();
  if (!data) return { ...ownerDb().settings };
  return mapSettings(data as unknown as SettingsRow);
}

export async function updateStoreSettings(
  patch: Partial<StoreSettingsData>
): Promise<StoreSettingsData> {
  const supabase = getClient();
  if (!supabase) {
    const db = ownerDb();
    db.settings = { ...db.settings, ...patch };
    return ok({ ...db.settings });
  }

  const { data: existing } = await supabase
    .from("store_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  const row: Record<string, unknown> = {};
  if (patch.storeName !== undefined) row.store_name = patch.storeName;
  if (patch.storeWhatsapp !== undefined) row.store_whatsapp = patch.storeWhatsapp;
  if (patch.logoUrl !== undefined) row.logo_url = patch.logoUrl;
  if (patch.operationalHours !== undefined)
    row.operational_hours = patch.operationalHours;
  if (patch.paymentMethods !== undefined)
    row.payment_methods = patch.paymentMethods;
  if (patch.urgencyThresholdMinutes !== undefined)
    row.urgency_threshold_minutes = patch.urgencyThresholdMinutes;
  if (patch.storeStatus !== undefined) row.store_status = patch.storeStatus;

  if (existing?.id) {
    await supabase
      .from("store_settings")
      .update(row as never)
      .eq("id", existing.id);
  } else {
    await supabase.from("store_settings").insert(row as never);
  }
  return getStoreSettings();
}
