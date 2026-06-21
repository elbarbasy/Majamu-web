# Cashier UI Specification

## Design Principles
- Tablet Landscape First
- Satu papan kerja untuk kasir dan peracik
- Realtime Order Board
- Touch Friendly
- Mobile Responsive
- Desktop Responsive

## Layout Structure
1. Tab Status di bagian atas
2. Area Kartu Order di tengah
3. Ikon Catatan Shift
4. Toggle Riwayat Selesai

## Tab Status
- Semua
- Menunggu Bayar
- Diterima
- Diracik
- Siap Diambil

## Order Card
### Informasi Utama
- Nomor Meja atau Nomor Antrian
- Nama Pelanggan (khusus take away)
- Badge Dine In / Take Away
- Daftar Produk
- Waktu Tunggu
- Catatan Pelanggan

### Status Menunggu Bayar
- Total Harga ditampilkan jelas
- Tombol Konfirmasi Terima Bayar

### Status Diterima
- Tombol Mulai Racik

### Status Diracik
- Menampilkan kustomisasi produk
- Tombol Siap Diambil

### Status Siap Diambil
- Tombol Selesai

## Catatan Shift
- Pengeluaran
- Selisih Kas Kurang
- Selisih Kas Lebih
- Catatan Kas
- Lainnya

## Fitur Tambahan
- Notifikasi Order Baru
- Realtime Update
- Toggle Stok Habis Hari Ini
- Riwayat Order Selesai

## Responsive Requirements

### Mobile
- 1 kolom kartu order
- Tab dapat di-scroll horizontal

### Tablet
- Layout utama
- Grid 2 kolom kartu order

### Desktop
- Grid fleksibel 3-4 kolom
- Area kerja lebih luas
