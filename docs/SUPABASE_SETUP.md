# Supabase Setup Guide

## 1. Create Project

1. Login ke Supabase
2. Buat project baru
3. Pilih region terdekat
4. Simpan Project URL dan Anon Key

---

## 2. Database Setup

Jalankan file:

```sql
supabase/schema.sql
```

Kemudian jalankan:

```sql
supabase/seed.sql
```

---

## 3. Authentication Setup

Majamu menggunakan **Supabase Auth (Email/Password)** untuk:

- Owner
- Kasir

Pelanggan tidak memiliki akun.

> Kredensial disimpan di `auth.users` (Supabase Auth). Tabel `public.users`
> hanya menyimpan profil (name, role, is_active) yang tertaut via `auth_user_id` (#11).

### Auth Provider
- Email Password

### Disable
- Google Login
- GitHub Login
- Magic Link

---

## 4. Storage Buckets

Buat bucket berikut:

### products
Digunakan untuk:
- Foto Produk

### banners
Digunakan untuk:
- Banner Promo

### qr-codes
Digunakan untuk:
- QR Meja

---

## 5. Realtime Setup

Aktifkan Realtime untuk tabel:

- orders
- order_status_history
- payments
- store_settings

Digunakan oleh:

- Dashboard Kasir
- Tracking Pesanan Pelanggan
- Dashboard Owner

---

## 6. Environment Variables

Buat file:

```env
.env.local
```

Isi:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 7. Row Level Security (RLS)

> RLS diaktifkan untuk SEMUA tabel di `schema.sql`. Helper `current_user_role()`
> membaca peran dari tabel `users` berdasarkan `auth.uid()`.

### Public Read-Only (#9)

- products
- filter_chips
- product_filter_chips
- product_ingredients
- ingredients
- banners
- tables
- store_settings

### Customer (tanpa login)

- insert orders
- insert order_items
- insert payments
- read orders / order_items / order_status_history (tracking via status_url / receipt_number)

### Cashier

- update order status
- insert order_status_history
- manage shift notes

### Owner

- full access: products, filter_chips, ingredients, banners, tables, users,
  cash_entries, store_settings
- read activity_logs

---

## 8. Initial Data

Seed data minimum:

- 11 Filter Chip
- Produk Jamu
- Banner Awal
- Meja 1-20
- Owner Account

> Owner Account: buat user lewat Supabase Auth terlebih dahulu, lalu jalankan
> insert profil ke tabel `users` dengan `auth_user_id` user tersebut
> (lihat komentar di `supabase/seed.sql`).

---

## 9. Recommended Extensions

Aktifkan:

- pgcrypto
- uuid-ossp

---

## 10. Production Checklist

- Schema Imported
- Seed Imported
- Storage Bucket Created
- RLS Enabled
- Realtime Enabled
- Environment Variables Set
- Owner Account Created
- QR Tables Generated
