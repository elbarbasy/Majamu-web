/**
 * Cache order di localStorage agar halaman Struk (/receipt) dan Tracking (/order)
 * dapat menampilkan detail pesanan, termasuk saat berjalan tanpa Supabase (dev).
 * Diindeks berdasarkan receiptNumber dan statusUrl.
 */
"use client";

import type { OrderResult } from "@/services/orders.service";
import type { OrderStatus } from "@/types";

const KEY = "majamu-orders";

type OrderMap = Record<string, OrderResult>;

function readMap(): OrderMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OrderMap) : {};
  } catch {
    return {};
  }
}

function writeMap(map: OrderMap): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function saveOrder(order: OrderResult): void {
  const map = readMap();
  map[`receipt:${order.receiptNumber}`] = order;
  map[`status:${order.statusUrl}`] = order;
  writeMap(map);
}

export function getOrderByReceipt(receiptNumber: string): OrderResult | null {
  return readMap()[`receipt:${receiptNumber}`] ?? null;
}

export function getOrderByStatusUrl(statusUrl: string): OrderResult | null {
  return readMap()[`status:${statusUrl}`] ?? null;
}

export function updateCachedStatus(
  statusUrl: string,
  status: OrderStatus
): void {
  const map = readMap();
  const byStatus = map[`status:${statusUrl}`];
  if (!byStatus) return;
  byStatus.status = status;
  map[`status:${statusUrl}`] = byStatus;
  if (byStatus.receiptNumber) {
    map[`receipt:${byStatus.receiptNumber}`] = byStatus;
  }
  writeMap(map);
}
