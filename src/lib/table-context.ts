/**
 * Konteks meja dari QR (/table/[tableNumber]).
 * Disimpan di localStorage agar checkout dapat menentukan order_type otomatis
 * (CUSTOMER_UI.md: "Tipe order otomatis dari QR").
 */
"use client";

import { TABLE_CONTEXT_KEY } from "@/constants";
import type { OrderType } from "@/types";

export interface TableContext {
  orderType: OrderType;
  tableNumber: number | null;
}

const DEFAULT_CONTEXT: TableContext = {
  orderType: "take_away",
  tableNumber: null,
};

export function setTableContext(tableNumber: number): void {
  if (typeof window === "undefined") return;
  const ctx: TableContext = { orderType: "dine_in", tableNumber };
  try {
    localStorage.setItem(TABLE_CONTEXT_KEY, JSON.stringify(ctx));
  } catch {
    /* ignore */
  }
}

export function getTableContext(): TableContext {
  if (typeof window === "undefined") return DEFAULT_CONTEXT;
  try {
    const raw = localStorage.getItem(TABLE_CONTEXT_KEY);
    if (!raw) return DEFAULT_CONTEXT;
    const parsed = JSON.parse(raw) as TableContext;
    if (parsed.orderType === "dine_in" && typeof parsed.tableNumber === "number") {
      return parsed;
    }
    return DEFAULT_CONTEXT;
  } catch {
    return DEFAULT_CONTEXT;
  }
}

export function clearTableContext(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TABLE_CONTEXT_KEY);
  } catch {
    /* ignore */
  }
}
