# Majamu Receipt System

## Overview

Majamu menggunakan struk digital sebagai bukti transaksi utama.

Flow:

QR Meja
→ Checkout
→ Pembayaran
→ Struk Digital
→ Tracking Pesanan

---

## Receipt Number Format

```text
MJM-YYYYMMDD-XXXX
```

Contoh:

```text
MJM-20260621-0012
```

---

## Customer Route

```text
/receipt/[receiptNumber]
```

Contoh:

```text
/receipt/MJM-20260621-0012
```

---

## Receipt Layout

### Header
- Logo Majamu
- Nomor Struk
- Nomor Pesanan
- Tanggal
- Nomor Meja

### Items
- Nama Produk
- Qty
- Harga
- Subtotal

### Summary
- Total Item
- Total Pembayaran
- Metode Pembayaran

### Status
- Menunggu Bayar
- Diterima
- Diracik
- Siap Diambil
- Selesai

### Actions
- Download PDF
- Bagikan WhatsApp
- Lihat Status Pesanan

---

## Database Changes

Tambahkan pada tabel orders:

```sql
receipt_number text unique,
receipt_url text
```

---

## PDF Receipt

Isi PDF:

- Logo Majamu
- Detail Transaksi
- Ringkasan Produk
- Total Pembayaran
- QR Tracking Pesanan

---

## WhatsApp Template

Halo {{nama}},

Pesanan Anda berhasil dibuat.

No Order: {{order_number}}
No Struk: {{receipt_number}}
Total: {{total}}

Struk:
{{receipt_url}}

Status Pesanan:
{{status_url}}

---

## Owner Features

Pada halaman laporan:

- Lihat Struk
- Download PDF
- Cetak PDF

---

## MVP Scope

- Struk Digital HTML
- Download PDF
- Share WhatsApp
- QR Tracking Pesanan
