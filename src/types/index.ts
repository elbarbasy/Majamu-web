/**
 * Domain types untuk modul Customer Majamu.
 * Diturunkan dari database types + kebutuhan UI (CUSTOMER_UI.md).
 */
import type {
  OrderStatus,
  OrderType,
  PaymentMethod,
  SweetnessLevel,
} from "@/types/database";

export type {
  OrderStatus,
  OrderType,
  PaymentMethod,
  SweetnessLevel,
} from "@/types/database";

/** Produk yang dipakai di katalog/detail (gabungan tabel + relasi). */
export interface Product {
  id: string;
  name: string;
  photoUrl: string | null;
  description: string | null;
  /** Deskripsi kontekstual tambahan (mis. kapan cocok diminum). */
  contextualDescription?: string | null;
  price: number;
  stockStatus: "available" | "out_of_stock";
  /** Nama filter chip yang menempel pada produk (manfaat / kategori). */
  filterChips: string[];
  /** Komposisi/bahan. */
  ingredients: string[];
}

/** Item di keranjang (disimpan di localStorage). */
export interface CartItem {
  productId: string;
  name: string;
  photoUrl: string | null;
  price: number;
  quantity: number;
  sweetnessLevel: SweetnessLevel;
}

/** Banner promo homepage. */
export interface Banner {
  id: string;
  title: string | null;
  imageUrl: string | null;
}

/** Ringkasan order tersimpan di riwayat localStorage pelanggan. */
export interface CustomerHistoryOrder {
  orderId: string;
  statusUrl: string;
  receiptNumber: string | null;
  displayNumber: string | null;
  orderType: OrderType | null;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  itemsSummary: string;
}

/** Satu pertanyaan quiz rekomendasi. */
export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface QuizOption {
  label: string;
  /** Nama filter chip yang dibobot bila opsi dipilih. */
  chip: string;
}
