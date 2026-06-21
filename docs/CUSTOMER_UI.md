# Customer UI Specification

## Header
- Icon kiri logo (bukan hamburger generik)
- Logo Majamu
- Search Menu

## Panel Setengah Layar (Icon Kiri Logo)
- Tentang Majamu
- Kontak
- Riwayat Pesanan

## Homepage
1. Banner Promo
2. 11 Filter Chip sesuai PRD
3. Card Quiz Rekomendasi (inline di antara filter dan grid produk)
4. Grid Produk
5. Cart Bar Mengambang (muncul jika ada item)
6. Badge Pesanan Aktif (bottom fixed)

## Filter Chip
- Semua
- Rekomendasi
- Daya Tahan Tubuh
- Pencernaan Nyaman
- Pegal & Capek
- Tenang & Tidur Nyenyak
- Batuk & Tenggorokan
- Kulit Sehat
- Stamina & Energi
- Nyaman di Hari Spesial
- Susu & Soda Jamu

## Quiz Rekomendasi
- 4 pertanyaan situasional
- Progress bar
- Hasil tersimpan di session storage
- Menampilkan 2-3 produk
- Satu produk ditandai sebagai Paling Cocok
- Dapat diulang kembali

## Detail Produk
- Bottom Sheet
- Foto
- Nama dan Harga
- Chip Manfaat
- Deskripsi Utama
- Deskripsi Kontekstual
- Komposisi (collapsible)
- Tingkat Manis
- Kontrol Jumlah
- Tombol Aksi Sticky

## Keranjang
- Halaman penuh
- Edit item melalui detail sheet
- Catatan berlaku untuk seluruh order
- Tipe order otomatis dari QR

## Checkout
- Nama Pemesan (opsional)
- Nomor WhatsApp (wajib)
- Catatan Tambahan
- Metode Pembayaran
- Ringkasan Order

## Status Pesanan
- Menunggu Bayar
- Diterima
- Diracik
- Siap Diambil
- Selesai

## Riwayat Pesanan
- Disimpan di local storage perangkat
- Tidak menggunakan akun pelanggan
- Menampilkan maksimal 30 riwayat terakhir
- Menampilkan pesanan aktif yang dipin di bagian atas
