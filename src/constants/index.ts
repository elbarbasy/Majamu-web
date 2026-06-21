/**
 * Konstanta domain Customer Majamu.
 * Label & urutan mengikuti CUSTOMER_UI.md dan WIREFRAMES.md.
 */
import type { OrderStatus, PaymentMethod, SweetnessLevel } from "@/types";
import type { QuizQuestion } from "@/types";

/** 11 Filter Chip sesuai CUSTOMER_UI.md (urutan tampil). */
export const FILTER_CHIPS: string[] = [
  "Semua",
  "Rekomendasi",
  "Daya Tahan Tubuh",
  "Pencernaan Nyaman",
  "Pegal & Capek",
  "Tenang & Tidur Nyenyak",
  "Batuk & Tenggorokan",
  "Kulit Sehat",
  "Stamina & Energi",
  "Nyaman di Hari Spesial",
  "Susu & Soda Jamu",
];

export const FILTER_ALL = "Semua";
export const FILTER_RECOMMENDED = "Rekomendasi";

/** Tingkat manis (enum DB #8). */
export const SWEETNESS_LEVELS: { value: SweetnessLevel; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "less", label: "Kurang Manis" },
  { value: "low", label: "Sedikit Manis" },
  { value: "no_sugar", label: "Tanpa Gula" },
];

export const DEFAULT_SWEETNESS: SweetnessLevel = "normal";

export function sweetnessLabel(value: SweetnessLevel): string {
  return SWEETNESS_LEVELS.find((s) => s.value === value)?.label ?? value;
}

/** Metode pembayaran (PRD: Tunai, QRIS, Midtrans). */
export const PAYMENT_METHODS: { value: PaymentMethod; label: string; hint: string }[] =
  [
    { value: "cash", label: "Tunai", hint: "Bayar langsung di kasir" },
    { value: "qris", label: "QRIS", hint: "Scan QRIS untuk membayar" },
    { value: "midtrans", label: "Midtrans", hint: "Kartu / e-wallet / transfer" },
  ];

/** Urutan status untuk timeline tracking (WIREFRAMES.md Order Tracking). */
export const ORDER_STATUS_STEPS: { value: OrderStatus; label: string }[] = [
  { value: "menunggu_bayar", label: "Menunggu Bayar" },
  { value: "diterima", label: "Diterima" },
  { value: "diracik", label: "Diracik" },
  { value: "siap_diambil", label: "Siap Diambil" },
  { value: "selesai", label: "Selesai" },
];

export function statusLabel(value: OrderStatus): string {
  return ORDER_STATUS_STEPS.find((s) => s.value === value)?.label ?? value;
}

export function statusIndex(value: OrderStatus): number {
  const idx = ORDER_STATUS_STEPS.findIndex((s) => s.value === value);
  return idx < 0 ? 0 : idx;
}

/** 4 pertanyaan situasional quiz (CUSTOMER_UI.md: 4 pertanyaan). */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "kondisi",
    question: "Apa yang sedang kamu rasakan hari ini?",
    options: [
      { label: "Badan pegal & capek", chip: "Pegal & Capek" },
      { label: "Pencernaan kurang nyaman", chip: "Pencernaan Nyaman" },
      { label: "Tenggorokan tidak enak", chip: "Batuk & Tenggorokan" },
      { label: "Ingin jaga daya tahan", chip: "Daya Tahan Tubuh" },
    ],
  },
  {
    id: "tujuan",
    question: "Apa tujuan utamamu minum jamu?",
    options: [
      { label: "Menambah stamina & energi", chip: "Stamina & Energi" },
      { label: "Lebih tenang & tidur nyenyak", chip: "Tenang & Tidur Nyenyak" },
      { label: "Merawat kulit dari dalam", chip: "Kulit Sehat" },
      { label: "Menjaga imun tubuh", chip: "Daya Tahan Tubuh" },
    ],
  },
  {
    id: "momen",
    question: "Kapan kamu ingin menikmatinya?",
    options: [
      { label: "Saat bersantai", chip: "Tenang & Tidur Nyenyak" },
      { label: "Sebelum beraktivitas", chip: "Stamina & Energi" },
      { label: "Di hari spesial", chip: "Nyaman di Hari Spesial" },
      { label: "Kapan saja", chip: "Rekomendasi" },
    ],
  },
  {
    id: "selera",
    question: "Pilih gaya minuman favoritmu.",
    options: [
      { label: "Jamu tradisional", chip: "Rekomendasi" },
      { label: "Susu & soda jamu", chip: "Susu & Soda Jamu" },
      { label: "Hangat menenangkan", chip: "Tenang & Tidur Nyenyak" },
      { label: "Segar menyegarkan", chip: "Pencernaan Nyaman" },
    ],
  },
];

/** Batas riwayat pelanggan di localStorage (CUSTOMER_UI.md: maks 30). */
export const HISTORY_LIMIT = 30;

/** Key localStorage untuk konteks meja aktif (dari /table/[id]). */
export const TABLE_CONTEXT_KEY = "majamu_table_context";

/** Statis: info toko untuk panel "Tentang/Kontak". */
export const STORE_INFO = {
  name: "Majamu",
  tagline: "Jamu modern, hangat & menyehatkan",
  about:
    "Majamu menghadirkan jamu modern dengan bahan alami pilihan. Pesan langsung dari meja Anda dengan memindai QR.",
  whatsapp: "628000000000",
};
