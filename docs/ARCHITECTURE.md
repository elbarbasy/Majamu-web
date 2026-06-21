# Majamu Architecture (MVP)

## Stack
- Next.js 15
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Supabase (Auth, Database, Storage, Realtime)
- Midtrans
- Fonnte WhatsApp
- Vercel

## Roles
- Owner
- Kasir
- Pelanggan

## QR Ordering Flow
1. Owner membuat QR untuk setiap meja.
2. QR mengarah ke URL /table/[id].
3. Pelanggan scan QR.
4. Sistem otomatis mengenali nomor meja.
5. Pelanggan memilih menu.
6. Checkout.
7. Order masuk ke dashboard kasir realtime.

## Customer Identity
- Tidak wajib login.
- Nama dan nomor WhatsApp disimpan saat checkout pertama.
- Riwayat pesanan terhubung ke customer dan nomor WhatsApp.
- LocalStorage digunakan untuk mengenali pelanggan yang kembali dari perangkat yang sama.

## Modul Owner
- Dashboard
- Produk
- Kategori
- Banner
- QR Meja
- Laporan Penjualan
- Pengaturan

## Modul Kasir
- Login
- Daftar Pesanan
- Update Status Pesanan
- Tutup Shift

## Modul Pelanggan
- Menu
- Pencarian
- Filter
- Keranjang
- Checkout
- Tracking Pesanan
- Riwayat Pesanan

## Fitur Ditunda
- Supplier
- Purchase Order
- Loyalty Point
- Voucher
- Multi Cabang
- AI Recommendation
