/**
 * owner-store — sumber data in-memory untuk modul Owner (DEV).
 *
 * Disemai dari sample-data agar seluruh halaman Owner dapat dioperasikan
 * (CRUD, toggle, rekap) secara interaktif tanpa Supabase. Data bertahan
 * selama sesi (module singleton).
 *
 * CATATAN PRODUKSI: untuk koneksi nyata, ganti pembacaan/penulisan di
 * owner.service.ts agar memakai Supabase (lihat pola di products.service.ts
 * dan cashier.service.ts). Struktur tipe di sini selaras dengan schema.sql.
 */
import { FILTER_CHIPS } from "@/constants";
import { SAMPLE_BANNERS, SAMPLE_PRODUCTS } from "@/lib/sample-data";

export interface OwnerProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  photoUrl: string | null;
  stockStatus: "available" | "out_of_stock";
  filterChips: string[];
  ingredients: string[];
  isPopular: boolean;
  temperatureEnabled: boolean;
  sweetnessEnabled: boolean;
}

export interface FilterChipItem {
  id: string;
  name: string;
  sortOrder: number;
}

export interface IngredientItem {
  id: string;
  name: string;
  category: string;
}

export interface BannerItem {
  id: string;
  title: string;
  imageUrl: string | null;
  isActive: boolean;
}

export interface TableItem {
  id: string;
  tableNumber: number;
  isActive: boolean;
}

export interface CashierItem {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export interface CashEntryItem {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  description: string;
  createdAt: string;
}

export interface StoreSettingsData {
  storeName: string;
  tagline: string;
  brandStory: string;
  quizImageUrl: string | null;
  panelLogoUrl: string | null;
  storeWhatsapp: string;
  instagram: string;
  address: string;
  logoUrl: string | null;
  operationalHours: Record<string, { open: string; close: string; closed: boolean }>;
  paymentMethods: string[];
  urgencyThresholdMinutes: number;
  thresholdSelisihKas: number;  // v1.1
  storeStatus: "open" | "closed";
}

let counter = 1000;
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

function iso(daysAgo = 0, minsAgo = 0): string {
  return new Date(Date.now() - daysAgo * 86400000 - minsAgo * 60000).toISOString();
}

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

interface OwnerDb {
  products: OwnerProduct[];
  chips: FilterChipItem[];
  ingredients: IngredientItem[];
  banners: BannerItem[];
  tables: TableItem[];
  cashiers: CashierItem[];
  cashEntries: CashEntryItem[];
  activityLogs: ActivityLogItem[];
  settings: StoreSettingsData;
  seeded: boolean;
}

function seed(): OwnerDb {
  const products: OwnerProduct[] = SAMPLE_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description ?? "",
    photoUrl: p.photoUrl,
    stockStatus: p.stockStatus,
    filterChips: p.filterChips,
    ingredients: p.ingredients,
    isPopular: p.filterChips.includes("Rekomendasi"),
    temperatureEnabled: p.temperatureEnabled,
    sweetnessEnabled: p.sweetnessEnabled,
  }));

  const chips: FilterChipItem[] = FILTER_CHIPS.filter(
    (c) => c !== "Semua"
  ).map((name, i) => ({ id: nextId("chip"), name, sortOrder: i + 1 }));

  const ingredientNames = [
    ["Kunyit", "rimpang"],
    ["Asam Jawa", "buah"],
    ["Jahe Merah", "rimpang"],
    ["Kencur", "rimpang"],
    ["Temulawak", "rimpang"],
    ["Madu", "pemanis"],
    ["Gula Aren", "pemanis"],
    ["Kayu Manis", "rempah"],
    ["Cengkeh", "rempah"],
    ["Susu", "olahan"],
  ];
  const ingredients: IngredientItem[] = ingredientNames.map(([name, category]) => ({
    id: nextId("ing"),
    name,
    category,
  }));

  const banners: BannerItem[] = SAMPLE_BANNERS.map((b) => ({
    id: b.id,
    title: b.title ?? "",
    imageUrl: b.imageUrl,
    isActive: true,
  }));

  const tables: TableItem[] = Array.from({ length: 20 }, (_, i) => ({
    id: nextId("tbl"),
    tableNumber: i + 1,
    isActive: true,
  }));

  const cashiers: CashierItem[] = [
    { id: nextId("usr"), name: "Kasir Pagi", email: "pagi@majamu.local", isActive: true },
    { id: nextId("usr"), name: "Kasir Sore", email: "sore@majamu.local", isActive: true },
  ];

  const cashEntries: CashEntryItem[] = [
    {
      id: nextId("cash"),
      type: "income",
      category: "Penjualan Tunai",
      amount: 250000,
      description: "Setoran kas shift pagi",
      createdAt: iso(0, 120),
    },
    {
      id: nextId("cash"),
      type: "expense",
      category: "Belanja Bahan",
      amount: 80000,
      description: "Jahe & kunyit",
      createdAt: iso(0, 200),
    },
    {
      id: nextId("cash"),
      type: "expense",
      category: "Operasional",
      amount: 25000,
      description: "Gas & kemasan",
      createdAt: iso(1, 0),
    },
  ];

  const activityLogs: ActivityLogItem[] = [
    {
      id: nextId("log"),
      action: "login",
      description: "Kasir Pagi masuk shift",
      createdAt: iso(0, 130),
    },
    {
      id: nextId("log"),
      action: "stock_update",
      description: "Susu Jahe Jamu ditandai stok habis",
      createdAt: iso(0, 90),
    },
  ];

  const operationalHours: StoreSettingsData["operationalHours"] = {};
  DAYS.forEach((d) => {
    operationalHours[d] = { open: "08:00", close: "21:00", closed: d === "sun" };
  });

  const settings: StoreSettingsData = {
    storeName: "Majamu",
    tagline: "Diracik Saat Itu Juga",
    brandStory:
      "Majamu menghadirkan jamu modern yang diracik saat itu juga dengan bahan alami pilihan. Untuk keluarga profesional dan anak muda yang peduli kesehatan alami.",
    quizImageUrl: null,
    panelLogoUrl: null,
    storeWhatsapp: "628000000000",
    instagram: "@majamu.id",
    address: "Jl. Herbal No. 1, Indonesia",
    logoUrl: null,
    operationalHours,
    paymentMethods: ["cash", "qris"],
    urgencyThresholdMinutes: 7,
    thresholdSelisihKas: 10000,
    storeStatus: "open",
  };

  return {
    products,
    chips,
    ingredients,
    banners,
    tables,
    cashiers,
    cashEntries,
    activityLogs,
    settings,
    seeded: true,
  };
}

let db: OwnerDb | null = null;

export function ownerDb(): OwnerDb {
  if (!db) db = seed();
  return db;
}
