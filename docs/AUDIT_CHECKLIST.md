# Majamu — Audit Codebase vs Dokumentasi

> Audit implementasi terhadap **PRD.md, FEATURE_MATRIX.md, DESIGN_SYSTEM.md, WIREFRAMES.md**.
> Legenda: ✅ sesuai · 🔧 diperbaiki pada audit ini · ⏳ placeholder/lanjutan (didokumentasikan).

## 1. Fitur (PRD & FEATURE_MATRIX)

### Pelanggan
- ✅ Scan QR meja (`/table/[tableNumber]`) — deteksi meja otomatis
- ✅ Lihat menu, cari produk (search sheet), filter kategori (filter chips)
- ✅ Quiz rekomendasi (full-screen bottom sheet)
- ✅ Detail produk (bottom sheet), keranjang, checkout
- ✅ Tracking pesanan (timeline), riwayat (localStorage, maks 30)
- ✅ Struk digital + QR tracking + share WhatsApp + PDF

### Kasir
- 🔧 **Login** — sebelumnya `/login` kosong → kini diimplementasi (Supabase Auth + redirect peran)
- ✅ Order board realtime, ubah status, catatan shift, toggle stok, riwayat selesai

### Owner
- 🔧 **Login** (sama seperti di atas)
- ✅ Dashboard, Laporan (+export CSV/PDF), Kas, Produk, Filter Quiz, Ingredients, Banner, QR Meja, Kasir (+log aktivitas), Pengaturan

### Pembayaran (PRD)
- ✅ Pilihan Tunai / QRIS / Midtrans pada checkout
- ✅ **Integrasi Midtrans Snap** (`/api/payments`) + **webhook** (`/api/payments/callback`) + **Fonnte WhatsApp** saat pembayaran lunas (aktif bila env terisi; checkout fallback aman tanpa env)

## 2. Route

- ✅ Semua route Customer, Cashier, Owner ada & terimplementasi
- 🔧 **`/login`** — halaman tadinya kosong (juga berisiko menggagalkan build) → diimplementasi penuh
- 🔧 **21 Route Handler `/api/*`** tadinya **file kosong** (berisiko `next build` gagal & "route kosong") → diisi handler placeholder valid (HTTP 501) via `src/lib/api.ts`, sesuai daftar di FEATURE_MATRIX/ROUTES
- 🔧 **Proteksi route** — ditambah `src/middleware.ts` + `lib/supabase/middleware.ts`: refresh sesi & redirect `/owner` & `/pos` ke `/login` bila belum login (hanya aktif saat Supabase terkonfigurasi; dilewati di dev)

## 3. Database (schema.sql) — pemakaian

| Tabel | Dipakai | Catatan |
|-------|---------|---------|
| products, filter_chips, banners, ingredients, product_filter_chips, product_ingredients | ✅ | `products.service` (customer) |
| orders, order_items, payments, order_status_history | ✅ | checkout + cashier board |
| shift_notes | ✅ | cashier.service |
| users | ✅ | login (`auth.service`) + daftar/CRUD kasir (`owner.service`) |
| store_settings | ✅ | owner read/update; **status toko kini direfleksikan ke pelanggan** (`settings.service`) |
| cash_entries, activity_logs | ✅ | modul Owner kini Supabase-first (fallback dev store) |
| tables | ✅ | owner CRUD + **validasi nomor meja saat scan QR** (`tables.service`) |
| products/filter_chips/ingredients/banners (Owner) | ✅ | Supabase-first + sinkronisasi join (product_filter_chips, product_ingredients) |
| daily_sequences / `next_daily_sequence()` | ⏳ | Nomor struk/antrian masih di-generate sisi klien; produksi sebaiknya pakai RPC ini |

## 4. UI vs Wireframe (WIREFRAMES.md)

- ✅ Customer Home: Header → Banner → Filter Chips → Quiz Card → Produk Populer → Semua Produk → Floating Cart Bar
- ✅ Product Detail: foto, nama, harga, manfaat, deskripsi, komposisi, tingkat manis, quantity, tambah
- ✅ Cart / Checkout / Receipt / Order Tracking sesuai wireframe
- ✅ Cashier: tab status + grid order card; Shift Notes (pengeluaran/selisih/catatan)
- ✅ Owner Dashboard (omzet, pesanan, terlaris, status toko), QR Tables, Reports (harian/mingguan/bulanan + export)
- 🔧 **Owner Products**: wireframe minta **Search, Filter, Product Table, Add** → ditambah **Filter (per chip)** & **Pagination** (DESIGN_SYSTEM "Management Table")

## 5. DESIGN_SYSTEM

- ✅ Palet warna (#7A5230/#D8B98A/#7FA36B/#F8F5EF + success/warning/error), radius (card 16/modal 24/button 14/chip full), font Inter/Geist
- ✅ Header (menu kiri-logo, logo, search kanan), Filter chips 1 baris no-wrap sticky, Quiz card (ikon herbal + CTA), Product card (image/name/price/quick add), Floating cart bar
- 🔧 **Cashier Order Card**: ditambah **Status Badge** eksplisit (sebelumnya hanya tab + tombol aksi)
- 🔧 **Management Table**: Search + **Filter** + **Pagination** kini lengkap (Produk)
- ✅ Responsive: Customer mobile (`max-w-screen-sm`), Cashier tablet (grid 1/2/3-4), Owner desktop (sidebar + drawer mobile); target sentuh 44px (`.touch-target`)
- ✅ UX: mobile-first, tanpa login pelanggan, tanpa bottom-nav, hamburger hanya info/riwayat, quiz full-screen sheet

## 6. Responsivitas komponen

- ✅ Tabel Owner (Produk/Kas/Kasir) dibungkus `overflow-x-auto`
- ✅ Board kasir grid adaptif; kartu besar
- ✅ Overlay (bottom sheet/side panel/dialog) berbasis portal, kunci scroll, Esc
- ✅ Sidebar Owner: drawer pada layar kecil

## 7. Sisa pekerjaan (didokumentasikan, di luar audit UI ini)

1. ✅ ~~Alihkan modul Owner dari `owner-store` (in-memory) ke Supabase~~ — **selesai** (Supabase-first + fallback dev store).
2. Implementasi Route Handler `/api/*` secara nyata — **payments** (`/api/payments`, `/api/payments/callback`) **sudah nyata**; sisanya masih placeholder 501 (operasi data via client services).
3. ✅ ~~Integrasi Midtrans (`/api/payments/callback`) & Fonnte (WhatsApp)~~ — **selesai** (`lib/midtrans.ts`, `lib/midtrans-client.ts`, `lib/fonnte.ts` + 2 route + wiring checkout; aktif saat env terisi).
4. Generate nomor struk/antrian via `next_daily_sequence()` (atomik) menggantikan generator klien.
5. ✅ ~~Validasi nomor meja terhadap tabel `tables` saat scan QR~~ — **selesai** (`tables.service`).
6. ✅ ~~Refleksikan `store_settings.store_status` (toko tutup) ke sisi pelanggan~~ — **selesai** (`settings.service`).
7. ✅ ~~**Laporan**: agregasi penuh dari Supabase~~ — **selesai** (totalSales, jumlah pesanan, metode bayar, produk terlaris, deret waktu dihitung dari `orders`/`order_items`; fallback estimasi bila tanpa Supabase).
8. Pembuatan akun Kasir penuh via Supabase Auth admin (kini owner menulis profil di tabel `users`).

> Build/typecheck belum dapat dijalankan di sandbox (mode `INTEGRATIONS_ONLY`, registry npm 403).
> Perbaikan disusun agar lolos lint `next build` (tanpa import ganda/tak terpakai pada file yang diubah).
