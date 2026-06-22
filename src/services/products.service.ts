/**
 * products.service — pengambilan data katalog untuk Customer.
 *
 * Optimasi performa:
 * - Cache produk & banner di memori (refetch hanya tiap 60 detik).
 * - Query tidak menyertakan photo_url di list jika terlalu panjang (data URL).
 * - Foto lengkap dimuat hanya saat detail produk dibuka.
 */
"use client";

import { createClient } from "@/lib/supabase/client";
import { SAMPLE_BANNERS, SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { Banner, Product } from "@/types";

type ProductRow = {
  id: string;
  name: string;
  photo_url: string | null;
  description: string | null;
  price: number;
  stock_status: string | null;
  temperature_enabled: boolean | null;
  sweetness_enabled: boolean | null;
  product_filter_chips: { filter_chips: { name: string } | null }[] | null;
  product_ingredients: { ingredients: { name: string } | null }[] | null;
};

function mapProduct(row: ProductRow): Product {
  // Jangan tampilkan data URL di list (berat); hanya URL pendek (Storage).
  const photo = row.photo_url;
  const photoUrl =
    photo && photo.length < 500 ? photo : null; // data URL > 500 chars = skip di list

  return {
    id: row.id,
    name: row.name,
    photoUrl,
    description: row.description,
    price: Number(row.price) || 0,
    stockStatus: row.stock_status === "out_of_stock" ? "out_of_stock" : "available",
    temperatureEnabled: Boolean(row.temperature_enabled),
    sweetnessEnabled: row.sweetness_enabled !== false,
    filterChips: (row.product_filter_chips ?? [])
      .map((pc) => pc.filter_chips?.name)
      .filter((n): n is string => Boolean(n)),
    ingredients: (row.product_ingredients ?? [])
      .map((pi) => pi.ingredients?.name)
      .filter((n): n is string => Boolean(n)),
  };
}

// ---- In-memory cache (hindari refetch setiap navigasi/render) ----
let productsCache: { data: Product[]; ts: number } | null = null;
let bannersCache: { data: Banner[]; ts: number } | null = null;
const CACHE_TTL = 60_000; // 60 detik

function isFresh(cache: { ts: number } | null): boolean {
  return Boolean(cache && Date.now() - cache.ts < CACHE_TTL);
}

export async function getProducts(): Promise<Product[]> {
  if (isFresh(productsCache)) return productsCache!.data;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        `id, name, photo_url, description, price, stock_status,
         temperature_enabled, sweetness_enabled,
         product_filter_chips ( filter_chips ( name ) ),
         product_ingredients ( ingredients ( name ) )`
      )
      .eq("menu_status", "active")
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) {
      productsCache = { data: SAMPLE_PRODUCTS, ts: Date.now() };
      return SAMPLE_PRODUCTS;
    }
    const mapped = (data as unknown as ProductRow[]).map(mapProduct);
    productsCache = { data: mapped, ts: Date.now() };
    return mapped;
  } catch (err) {
    console.warn("[products.service] fallback ke sample data:", err);
    productsCache = { data: SAMPLE_PRODUCTS, ts: Date.now() };
    return SAMPLE_PRODUCTS;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        `id, name, photo_url, description, price, stock_status,
         temperature_enabled, sweetness_enabled,
         product_filter_chips ( filter_chips ( name ) ),
         product_ingredients ( ingredients ( name ) )`
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return SAMPLE_PRODUCTS.find((p) => p.id === id) ?? null;
    }
    const row = data as unknown as ProductRow;
    // Untuk detail: tampilkan foto lengkap (termasuk data URL).
    return {
      ...mapProduct(row),
      photoUrl: row.photo_url, // full URL/data URL
    };
  } catch (err) {
    console.warn("[products.service] fallback ke sample data:", err);
    return SAMPLE_PRODUCTS.find((p) => p.id === id) ?? null;
  }
}

export async function getBanners(): Promise<Banner[]> {
  if (isFresh(bannersCache)) return bannersCache!.data;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("banners")
      .select("id, title, image_url")
      .eq("is_active", true);

    if (error) throw error;
    if (!data || data.length === 0) {
      bannersCache = { data: SAMPLE_BANNERS, ts: Date.now() };
      return SAMPLE_BANNERS;
    }
    const mapped = data.map((b) => ({
      id: b.id,
      title: b.title,
      // Skip data URL di banner list juga (berat).
      imageUrl: b.image_url && b.image_url.length < 500 ? b.image_url : null,
    }));
    bannersCache = { data: mapped, ts: Date.now() };
    return mapped;
  } catch (err) {
    console.warn("[products.service] fallback ke sample banners:", err);
    bannersCache = { data: SAMPLE_BANNERS, ts: Date.now() };
    return SAMPLE_BANNERS;
  }
}

/** Invalidasi cache (dipanggil setelah owner update produk/banner). */
export function invalidateProductsCache(): void {
  productsCache = null;
  bannersCache = null;
}
