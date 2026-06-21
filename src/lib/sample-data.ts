/**
 * Sample data (DEV FALLBACK).
 *
 * Dipakai HANYA ketika Supabase belum dikonfigurasi / mengembalikan kosong,
 * agar UI Customer dapat dirender untuk pengembangan & review.
 * Data ini mencerminkan supabase/seed.sql. Tidak mengubah desain wireframe.
 */
import type { Banner, Product } from "@/types";

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "sample-kunyit-asam",
    name: "Kunyit Asam Segar",
    photoUrl: null,
    description: "Jamu klasik kunyit asam untuk pencernaan & kesegaran tubuh.",
    contextualDescription: "Cocok diminum siang hari saat tubuh terasa kurang segar.",
    price: 15000,
    stockStatus: "available",
    filterChips: ["Rekomendasi", "Pencernaan Nyaman", "Kulit Sehat"],
    ingredients: ["Kunyit", "Asam Jawa", "Gula Aren"],
  },
  {
    id: "sample-beras-kencur",
    name: "Beras Kencur Hangat",
    photoUrl: null,
    description: "Menambah stamina dan meredakan pegal setelah aktivitas.",
    contextualDescription: "Pas dinikmati setelah seharian beraktivitas.",
    price: 15000,
    stockStatus: "available",
    filterChips: ["Pegal & Capek", "Stamina & Energi"],
    ingredients: ["Beras", "Kencur", "Gula Aren"],
  },
  {
    id: "sample-jahe-merah",
    name: "Jahe Merah Madu",
    photoUrl: null,
    description: "Menghangatkan badan, baik untuk tenggorokan & daya tahan tubuh.",
    contextualDescription: "Hangat menenangkan saat cuaca dingin atau tenggorokan tidak enak.",
    price: 18000,
    stockStatus: "available",
    filterChips: ["Rekomendasi", "Daya Tahan Tubuh", "Batuk & Tenggorokan"],
    ingredients: ["Jahe Merah", "Madu"],
  },
  {
    id: "sample-wedang-uwuh",
    name: "Wedang Uwuh Rempah",
    photoUrl: null,
    description: "Racikan rempah hangat untuk relaksasi dan tidur nyenyak.",
    contextualDescription: "Nikmati menjelang malam untuk tubuh yang lebih rileks.",
    price: 20000,
    stockStatus: "available",
    filterChips: ["Tenang & Tidur Nyenyak"],
    ingredients: ["Cengkeh", "Kayu Manis", "Jahe Merah", "Gula Aren"],
  },
  {
    id: "sample-temulawak",
    name: "Temulawak Sehat",
    photoUrl: null,
    description: "Mendukung fungsi hati dan menjaga nafsu makan.",
    contextualDescription: "Baik diminum rutin untuk menjaga kebugaran.",
    price: 16000,
    stockStatus: "available",
    filterChips: ["Daya Tahan Tubuh", "Stamina & Energi"],
    ingredients: ["Temulawak", "Gula Aren"],
  },
  {
    id: "sample-susu-jahe",
    name: "Susu Jahe Jamu",
    photoUrl: null,
    description: "Perpaduan susu dan jahe, lembut dan menghangatkan.",
    contextualDescription: "Pilihan lembut untuk yang kurang suka rasa jamu pekat.",
    price: 22000,
    stockStatus: "out_of_stock",
    filterChips: ["Susu & Soda Jamu", "Batuk & Tenggorokan"],
    ingredients: ["Susu", "Jahe Merah", "Madu"],
  },
];

export const SAMPLE_BANNERS: Banner[] = [
  { id: "sample-banner-1", title: "Selamat Datang di Majamu", imageUrl: null },
  { id: "sample-banner-2", title: "Promo Jamu Hangat Hari Ini", imageUrl: null },
];


/* ---- Sample Cashier orders (DEV FALLBACK board kasir) ---- */
import type { CashierOrder } from "@/types";

function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60000).toISOString();
}

export const SAMPLE_CASHIER_ORDERS: CashierOrder[] = [
  {
    id: "sample-ord-1",
    statusUrl: "trk-sample-1",
    displayNumber: "Meja 3",
    orderType: "dine_in",
    customerName: null,
    whatsapp: "628111111111",
    notes: "Tolong tidak terlalu panas.",
    status: "menunggu_bayar",
    totalPrice: 33000,
    createdAt: minutesAgo(2),
    items: [
      { name: "Kunyit Asam Segar", quantity: 1, sweetnessLevel: "normal", price: 15000 },
      { name: "Jahe Merah Madu", quantity: 1, sweetnessLevel: "less", price: 18000 },
    ],
  },
  {
    id: "sample-ord-2",
    statusUrl: "trk-sample-2",
    displayNumber: "A-007",
    orderType: "take_away",
    customerName: "Sari",
    whatsapp: "628222222222",
    notes: null,
    status: "diterima",
    totalPrice: 30000,
    createdAt: minutesAgo(5),
    items: [
      { name: "Beras Kencur Hangat", quantity: 2, sweetnessLevel: "normal", price: 15000 },
    ],
  },
  {
    id: "sample-ord-3",
    statusUrl: "trk-sample-3",
    displayNumber: "Meja 8",
    orderType: "dine_in",
    customerName: null,
    whatsapp: "628333333333",
    notes: "Satu tanpa gula ya.",
    status: "diracik",
    totalPrice: 42000,
    createdAt: minutesAgo(9),
    items: [
      { name: "Wedang Uwuh Rempah", quantity: 1, sweetnessLevel: "no_sugar", price: 20000 },
      { name: "Temulawak Sehat", quantity: 1, sweetnessLevel: "low", price: 16000 },
      { name: "Kunyit Asam Segar", quantity: 1, sweetnessLevel: "normal", price: 15000 },
    ],
  },
  {
    id: "sample-ord-4",
    statusUrl: "trk-sample-4",
    displayNumber: "A-008",
    orderType: "take_away",
    customerName: "Budi",
    whatsapp: "628444444444",
    notes: null,
    status: "siap_diambil",
    totalPrice: 22000,
    createdAt: minutesAgo(12),
    items: [
      { name: "Susu Jahe Jamu", quantity: 1, sweetnessLevel: "normal", price: 22000 },
    ],
  },
];
