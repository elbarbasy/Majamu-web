/**
 * products.service — pengambilan data katalog untuk Customer.
 *
 * Sumber utama: Supabase (browser client). Bila Supabase belum dikonfigurasi
 * atau mengembalikan kosong, fungsi memakai SAMPLE_* sebagai fallback dev
 * (lihat lib/sample-data.ts) agar UI tetap dapat dirender.
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
  return {
    id: row.id,
    name: row.name,
    photoUrl: row.photo_url,
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

export async function getProducts(): Promise<Product[]> {
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
    if (!data || data.length === 0) return SAMPLE_PRODUCTS;
    return (data as unknown as ProductRow[]).map(mapProduct);
  } catch (err) {
    console.warn("[products.service] fallback ke sample data:", err);
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
    return mapProduct(data as unknown as ProductRow);
  } catch (err) {
    console.warn("[products.service] fallback ke sample data:", err);
    return SAMPLE_PRODUCTS.find((p) => p.id === id) ?? null;
  }
}

export async function getBanners(): Promise<Banner[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("banners")
      .select("id, title, image_url")
      .eq("is_active", true);

    if (error) throw error;
    if (!data || data.length === 0) return SAMPLE_BANNERS;
    return data.map((b) => ({
      id: b.id,
      title: b.title,
      imageUrl: b.image_url,
    }));
  } catch (err) {
    console.warn("[products.service] fallback ke sample banners:", err);
    return SAMPLE_BANNERS;
  }
}
