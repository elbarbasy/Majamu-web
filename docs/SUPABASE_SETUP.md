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

Majamu menggunakan login email dan password hanya untuk:

- Owner
- Kasir

Pelanggan tidak memiliki akun.

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

### Public Access

- products
- filter_chips
- banners

Read Only

### Customer

- create orders
- create order_items

### Cashier

- update order status
- create shift notes

### Owner

- full access

---

## 8. Initial Data

Seed data minimum:

- 11 Filter Chip
- Produk Jamu
- Banner Awal
- Meja 1-20
- Owner Account

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
