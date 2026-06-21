# Majamu Product Requirements Document (MVP)

## Overview
Majamu adalah platform pemesanan makanan dan minuman berbasis QR Code. Pelanggan melakukan scan QR di meja, memilih menu, melakukan checkout, dan pesanan langsung masuk ke dashboard kasir secara realtime.

## Objectives
- Mengurangi antrean pemesanan.
- Mempercepat proses pelayanan.
- Memudahkan owner memantau penjualan.
- Menyediakan pengalaman pemesanan digital.

## Roles
### Pelanggan
- Scan QR meja
- Melihat menu
- Mencari produk
- Filter kategori
- Menambahkan ke keranjang
- Checkout
- Melihat status pesanan
- Melihat riwayat pesanan

### Kasir
- Login
- Melihat pesanan masuk
- Mengubah status pesanan
- Membuat catatan shift

### Owner
- Dashboard
- Kelola produk
- Kelola kategori
- Kelola banner
- Kelola QR meja
- Laporan penjualan
- Pengaturan toko

## QR Ordering Flow
1. Owner membuat QR per meja.
2. QR mengarah ke /table/[id].
3. Sistem otomatis mengenali nomor meja.
4. Pelanggan memilih produk.
5. Checkout.
6. Pesanan masuk ke dashboard kasir.
7. Kasir memproses pesanan.

## Customer Identity
- Tidak wajib login.
- Nama dan nomor WhatsApp disimpan saat checkout pertama.
- Riwayat pesanan disimpan berdasarkan customer dan nomor WhatsApp.
- LocalStorage digunakan untuk mengenali pelanggan yang kembali menggunakan perangkat yang sama.

## Payment
- Tunai
- QRIS
- Midtrans

## Tech Stack
- Next.js 15
- TypeScript
- Tailwind CSS
- Shadcn UI
- Supabase
- Midtrans
- Fonnte
- Vercel

## Out of Scope
- Supplier
- Purchase Order
- Loyalty Point
- Voucher
- Multi Cabang
- AI Recommendation
