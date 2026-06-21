# Majamu — Rekomendasi Penyelesaian Konflik Dokumentasi

> Dokumen ini berisi rekomendasi keputusan untuk menyelaraskan ketidaksesuaian antar-dokumen
> yang ditemukan pada tahap analisis. **Belum ada kode aplikasi.** Setiap poin memuat:
> masalah, opsi, rekomendasi, dan dampak (file yang perlu diperbarui).
>
> Status setiap keputusan: `USULAN` sampai disetujui owner proyek.

---

## Ringkasan Keputusan

| # | Isu | Prioritas | Rekomendasi singkat | Status |
|---|-----|-----------|---------------------|--------|
| 1 | Dua spesifikasi API | 🔴 Kritis | Pakai RESTful `ROUTES.md`, pensiunkan `API_SPEC.md` | USULAN |
| 2 | Receipt system tak ada di schema | 🔴 Kritis | Masukkan ke MVP, tambah 2 kolom + 1 route | USULAN |
| 3 | Route `/product/[id]` & `/quiz` hilang | 🔴 Kritis | Tambahkan ke PROJECT_STRUCTURE | USULAN |
| 4 | Route/halaman `/login` tak terdefinisi | 🔴 Kritis | Tambah group `(auth)/login` | USULAN |
| 5 | `/pos/orders` inkonsisten | 🟠 Sedang | Hapus dari ROUTES (pakai tab, bukan route) | USULAN |
| 6 | Modul Kas tanpa tabel | 🟠 Sedang | Tambah tabel `cash_entries` | USULAN |
| 7 | "Kategori" vs "Filter Chip" | 🟠 Sedang | Satu istilah: `filter_chips` | USULAN |
| 8 | `sweetness_level` tanpa standar | 🟠 Sedang | Enum tetap 4 level | USULAN |
| 9 | RLS `ingredients` kurang | 🟠 Sedang | Tambah read publik utk `ingredients`, `tables`, `store_settings` | USULAN |
| 10 | Seed data minim | 🟡 Minor | Lengkapi seed sesuai SUPABASE_SETUP | USULAN |
| 11 | Supabase Auth vs `password_hash` | 🔴 Kritis | Pakai Supabase Auth, ganti kolom jadi `auth_user_id` | USULAN |
| 12 | `order_type`/penomoran tanpa aturan | 🟠 Sedang | CHECK constraint + aturan generate nomor | USULAN |
| 13 | `store_settings` kurang field | 🟡 Minor | Tambah kolom profil toko | USULAN |

---

## 1. Dua Spesifikasi API yang Bertentangan 🔴

**Masalah.** `ROUTES.md` memakai pola RESTful berbasis resource (`/api/orders`, `/api/products/[id]/status`), sedangkan `API_SPEC.md` memakai pola berbasis peran/aksi (`/api/menu`, `/api/checkout`, `/api/cashier/orders`, `/api/dashboard`). Endpoint untuk fungsi yang sama dinamai berbeda.

**Opsi.**
- **A. RESTful berbasis resource** (`ROUTES.md`) — selaras dengan App Router Next.js, mudah diprediksi, cocok untuk satu resource banyak peran.
- **B. Berbasis peran** (`API_SPEC.md`) — eksplisit per aktor, tetapi duplikatif (mis. `/api/menu` vs `/api/products`).

**Rekomendasi: Opsi A (RESTful).** Otorisasi peran ditangani di middleware/handler, bukan di path. `API_SPEC.md` ditandai *deprecated* dan dipertahankan hanya sebagai referensi historis.

**Pemetaan endpoint final (canonical):**

| Domain | Endpoint | Method | Akses |
|--------|----------|--------|-------|
| Auth | `/api/auth` | POST (login), DELETE (logout) | Publik → Owner/Kasir |
| Produk | `/api/products` | GET (list), POST | GET publik; tulis Owner |
| Produk | `/api/products/[id]` | GET, PUT, DELETE | GET publik; tulis Owner |
| Filter | `/api/filter-chips` | GET, POST, PUT, DELETE | GET publik; tulis Owner |
| Rekomendasi | `/api/recommendations` | POST (jawaban quiz → produk) | Publik |
| Ingredients | `/api/ingredients` | GET, POST, PUT, DELETE | GET publik; tulis Owner |
| Orders | `/api/orders` | GET (kasir/owner), POST (checkout) | POST publik; GET Kasir/Owner |
| Orders | `/api/orders/[id]` | GET | Publik via `status_url` / Kasir / Owner |
| Status | `/api/orders/[id]/status` | PATCH | Kasir/Owner |
| Tables | `/api/tables` | GET, POST, PUT, DELETE | GET publik; tulis Owner |
| Banners | `/api/banners` | GET, POST, PUT, DELETE | GET publik; tulis Owner |
| Cashiers | `/api/cashiers` | GET, POST, PUT, DELETE | Owner |
| Shift Notes | `/api/shift-notes` | GET, POST | Kasir/Owner |
| Cash | `/api/cash` | GET, POST | Owner (lihat #6) |
| Payments | `/api/payments` | POST (create) | Publik |
| Payments | `/api/payments/callback` | POST (webhook Midtrans) | Server-to-server |
| Reports | `/api/reports` | GET | Owner |
| Reports | `/api/reports/export` | GET (Excel/PDF) | Owner |
| Receipts | `/api/receipts/[receiptNumber]` | GET | Publik (lihat #2) |
| Settings | `/api/settings` | GET, PUT | GET publik (status toko); tulis Owner |
| Activity | `/api/activity-logs` | GET | Owner |

**Dampak:** perbarui `ROUTES.md` (tambah baris baru), tandai `API_SPEC.md` deprecated.

---

## 2. Receipt System Belum Ada di Schema 🔴

**Masalah.** `RECEIPT_SYSTEM.md` & `WIREFRAMES.md` mendefinisikan struk digital (nomor `MJM-YYYYMMDD-XXXX`, route `/receipt/[receiptNumber]`, PDF, share WA), tetapi tidak tercermin di `schema.sql`, `ROUTES.md`, atau `PROJECT_STRUCTURE.md`.

**Rekomendasi: Masukkan ke MVP** (sudah disebut sebagai MVP Scope di RECEIPT_SYSTEM.md).

**Perubahan database** (tambahan kolom pada `orders`):
```sql
alter table orders
  add column receipt_number text unique,
  add column receipt_url text;
```

**Aturan nomor struk:** `MJM-YYYYMMDD-XXXX` di mana `XXXX` = urutan harian (reset tiap hari). Digenerate saat order dibuat (POST `/api/orders`). Pertimbangkan tabel/kolom counter harian agar atomik (lihat #12 untuk strategi counter).

**Route baru:** `/receipt/[receiptNumber]` (customer group) dan API `/api/receipts/[receiptNumber]`.

**Dampak:** `schema.sql`, `DATABASE_SCHEMA.md`, `ERD.md`, `ROUTES.md`, `PROJECT_STRUCTURE.md`.

---

## 3. Route `/product/[productId]` & `/quiz` Hilang dari PROJECT_STRUCTURE 🔴

**Masalah.** Keduanya ada di `ROUTES.md` & `FEATURE_MATRIX.md` namun tidak tercantum pada struktur folder customer di `PROJECT_STRUCTURE.md`.

**Catatan desain.** `CUSTOMER_UI.md` menyatakan detail produk & quiz tampil sebagai **bottom sheet / full-screen sheet** (bukan halaman penuh). Maka route ini sebaiknya tetap ada untuk **deep-link / share / SEO**, namun secara UI dirender sebagai overlay (intercepting routes) jika memungkinkan.

**Rekomendasi.** Tambahkan ke `PROJECT_STRUCTURE.md`:
```text
(customer)
├── product/[productId]/page.tsx
└── quiz/page.tsx
```
Implementasi UI tetap bottom sheet; route berfungsi sebagai fallback/deep-link.

**Dampak:** `PROJECT_STRUCTURE.md`.

---

## 4. Route/Halaman `/login` Tidak Terdefinisi 🔴

**Masalah.** `FEATURE_MATRIX.md` & `USER_FLOW.md` menyebut login Owner/Kasir, tetapi `/login` tidak ada di `ROUTES.md` maupun `PROJECT_STRUCTURE.md`.

**Rekomendasi.** Tambahkan route group `(auth)`:
```text
src/app/(auth)/
└── login/page.tsx        # /login (satu form, redirect by role)
```
Satu halaman login; setelah autentikasi, redirect berdasarkan `role` (owner → `/owner`, cashier → `/pos`).

**Dampak:** `ROUTES.md`, `PROJECT_STRUCTURE.md`.

---

## 5. `/pos/orders` Inkonsisten 🟠

**Masalah.** `ROUTES.md` mencantumkan `/pos/orders`, tetapi `PROJECT_STRUCTURE.md` hanya punya `pos/`, `pos/completed/`, `pos/shift/`. CASHIER_UI menggambarkan status sebagai **tab dalam satu papan**, bukan route terpisah.

**Rekomendasi.** Hapus `/pos/orders` dari `ROUTES.md`. Status (Semua/Menunggu Bayar/Diterima/Diracik/Siap Diambil) adalah **tab/filter di dalam `/pos`**, bukan route. Struktur final kasir:
```text
(cashier)/pos/
├── page.tsx         # board + tab status
├── completed/page.tsx
└── shift/page.tsx
```

**Dampak:** `ROUTES.md`.

---

## 6. Modul Kas Tidak Punya Tabel Database 🟠

**Masalah.** `OWNER_UI.md` & `ROUTES.md` punya modul Kas (pemasukan, pengeluaran, rekap harian/bulanan, riwayat). `shift_notes` hanya menampung pengeluaran/selisih kas dari sisi kasir — tidak mencakup pemasukan & rekap penuh.

**Opsi.**
- **A.** Perluas `shift_notes` jadi tabel kas umum (kurang jelas semantiknya).
- **B.** Tambah tabel khusus `cash_entries`.

**Rekomendasi: Opsi B.**
```sql
create table cash_entries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income','expense')),
  category text,
  amount numeric(12,2) not null,
  description text,
  created_by uuid references users(id),
  created_at timestamptz default now()
);
```
`shift_notes` tetap fokus pada catatan shift kasir (selisih kas, catatan). Rekap harian/bulanan = agregasi `cash_entries` + `payments`.

**Dampak:** `schema.sql`, `DATABASE_SCHEMA.md`, `ERD.md`, `ROUTES.md` (`/api/cash`).

---

## 7. "Kategori" vs "Filter Chip" 🟠

**Masalah.** PRD & `API_SPEC.md` memakai istilah "kategori" / `/api/categories`. Dokumen lain memakai `filter_chips`. Tidak ada tabel `categories`.

**Rekomendasi.** Satu istilah resmi: **`filter_chips`**. "Kategori" pada PRD dianggap sinonim filter chip. Endpoint `/api/categories` tidak dipakai (digantikan `/api/filter-chips`).

**Dampak:** catatan klarifikasi di `PRD.md` (atau di dokumen ini), `API_SPEC.md` deprecated.

---

## 8. `sweetness_level` Tanpa Standar 🟠

**Masalah.** `order_items.sweetness_level` bertipe `text` bebas; UI menyebut "Tingkat Manis" tanpa nilai baku.

**Rekomendasi.** Tetapkan enum tetap (4 level), disimpan sebagai kode string:
```text
'normal' | 'less' | 'low' | 'no_sugar'
```
Label tampilan: Normal · Kurang Manis · Sedikit Manis · Tanpa Gula.
Tetap simpan sebagai `text` namun divalidasi di aplikasi (Zod) + opsional CHECK constraint.

**Dampak:** `DATABASE_SCHEMA.md`, `constants/`, validasi `checkout`.

---

## 9. RLS Belum Lengkap untuk Tabel yang Dibaca Publik 🟠

**Masalah.** `SUPABASE_SETUP.md` hanya menetapkan akses publik read untuk `products`, `filter_chips`, `banners`. Padahal customer juga perlu membaca `ingredients` (detail produk), `product_filter_chips`, `product_ingredients`, `tables` (validasi nomor meja), dan `store_settings` (status toko).

**Rekomendasi.** Tambahkan public **read-only** untuk:
- `ingredients`, `product_ingredients`, `product_filter_chips` (komposisi & tag produk)
- `tables` (read terbatas untuk validasi `/table/[id]`)
- `store_settings` (read terbatas: hanya `store_status` yang relevan)

Customer boleh `INSERT` ke `orders`, `order_items`, `payments`. `orders` boleh dibaca publik **hanya via `status_url`/`receipt_number`** (bukan list penuh).

**Dampak:** `SUPABASE_SETUP.md`, definisi policy RLS di migrasi.

---

## 10. Seed Data Minim 🟡

**Masalah.** `SUPABASE_SETUP.md` menuntut 11 filter chip, produk jamu, banner, meja 1–20, owner account. `seed.sql` hanya berisi 1 owner dengan placeholder hash.

**Rekomendasi.** Lengkapi `seed.sql`:
- 11 filter chip persis sesuai `CUSTOMER_UI.md` (urutan via `sort_order`).
- Beberapa produk jamu contoh + relasi filter & ingredients.
- 1–2 banner awal.
- Meja 1–20.
- Owner account: jika pakai Supabase Auth (#11), owner dibuat via Auth lalu baris profil di `users` mereferensi `auth_user_id` (hapus placeholder bcrypt).

**Dampak:** `seed.sql`.

---

## 11. Supabase Auth vs Kolom `password_hash` 🔴

**Masalah.** `SUPABASE_SETUP.md` menyarankan Supabase Auth (Email/Password), tapi tabel `users` punya `password_hash` sendiri → dua sistem auth paralel, rawan tidak sinkron.

**Opsi.**
- **A. Supabase Auth murni.** `auth.users` untuk kredensial; tabel `users` jadi profil (role, is_active) tertaut via `auth_user_id`. Aman, gratis, terintegrasi RLS.
- **B. Custom auth** dengan `password_hash` + bcrypt sendiri. Lebih banyak kerja & risiko keamanan.

**Rekomendasi: Opsi A.**
```sql
-- ganti password_hash menjadi:
auth_user_id uuid unique references auth.users(id) on delete cascade,
```
Hilangkan `password_hash`. RLS memanfaatkan `auth.uid()` + kolom `role`.

**Dampak:** `schema.sql`, `DATABASE_SCHEMA.md`, `seed.sql`, `SUPABASE_SETUP.md`, store `auth-store.ts`.

---

## 12. `order_type` & Penomoran Tanpa Aturan 🟠

**Masalah.** `order_type` (dine in/take away) & `display_number` tidak punya constraint/aturan generate. `store_settings.queue_counter` ada tetapi mekanismenya tak terdokumentasi.

**Rekomendasi.**
- `order_type`: `check (order_type in ('dine_in','take_away'))`.
- `dine_in` → identitas tampilan = nomor meja (`tables.table_number`).
- `take_away` → `display_number` = nomor antrian harian (mis. `A-001`), digenerate dari counter harian.
- Counter harian sebaiknya **atomik**. Opsi: gunakan Postgres sequence per hari, atau fungsi `RPC` yang `UPDATE ... RETURNING` pada baris counter dengan penanda tanggal (agar reset harian). Pakai counter ini juga untuk `XXXX` pada `receipt_number` (#2).

**Dampak:** `schema.sql`, `DATABASE_SCHEMA.md`, fungsi RPC/migrasi.

---

## 13. `store_settings` Kurang Field Pengaturan Owner 🟡

**Masalah.** `OWNER_UI.md` menyebut profil toko, jam operasional, WhatsApp toko, metode pembayaran. `store_settings` hanya punya `urgency_threshold_minutes`, `store_status`, `queue_counter`.

**Rekomendasi.** Tambahkan kolom:
```sql
alter table store_settings
  add column store_name text,
  add column store_whatsapp text,
  add column operational_hours jsonb,     -- {"mon":{"open":"08:00","close":"21:00"}, ...}
  add column payment_methods jsonb default '["cash","qris","midtrans"]'::jsonb,
  add column logo_url text;
```

**Dampak:** `schema.sql`, `DATABASE_SCHEMA.md`, `settings-store.ts`, `/api/settings`.

---

## Lampiran A — Daftar File Dokumentasi yang Perlu Diperbarui Setelah Persetujuan

| File | Perubahan |
|------|-----------|
| `ROUTES.md` | Tambah login, receipt; hapus `/pos/orders`; tambah `/api/cash`, `/api/receipts` |
| `API_SPEC.md` | Tandai *deprecated* |
| `PROJECT_STRUCTURE.md` | Tambah `(auth)/login`, `product/[id]`, `quiz`, `receipt/[receiptNumber]` |
| `DATABASE_SCHEMA.md` | Receipt cols, `cash_entries`, `auth_user_id`, store_settings, constraints |
| `ERD.md` | Relasi `cash_entries`, perubahan `users` |
| `SUPABASE_SETUP.md` | RLS lengkap, auth approach, realtime |
| `schema.sql` | Semua perubahan DDL di atas |
| `seed.sql` | Data lengkap |
| `PRD.md` | Klarifikasi "kategori = filter_chips" |

## Lampiran B — Skema Database Target (ringkas, sesudah keputusan)

Tabel: `users` (auth_user_id), `filter_chips`, `products`, `product_filter_chips`,
`ingredients`, `product_ingredients`, `tables`, `orders` (+receipt_number, +receipt_url),
`order_status_history`, `order_items` (sweetness enum), `payments`, `shift_notes`,
`cash_entries` (baru), `banners`, `activity_logs`, `store_settings` (+profil toko).
→ **16 tabel** (dari 15, +`cash_entries`).
