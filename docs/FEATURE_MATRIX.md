# Majamu Feature Matrix

| Feature | Customer | Cashier | Owner | Page | Database | API |
|----------|----------|----------|--------|------|-----------|-----|
| Lihat Produk | ✅ | ❌ | ✅ | / | products | /api/products |
| Filter Produk | ✅ | ❌ | ✅ | / | filter_chips | /api/filter-chips |
| Quiz Rekomendasi | ✅ | ❌ | Kelola | /quiz | filter_chips | /api/recommendations |
| Detail Produk | ✅ | ❌ | ✅ | /product/[id] | products, ingredients | /api/products/[id] |
| Keranjang | ✅ | ❌ | ❌ | /cart | - | local state |
| Checkout | ✅ | ❌ | ❌ | /checkout | orders, order_items | /api/orders |
| Tracking Pesanan | ✅ | ✅ | ✅ | /order/[statusUrl] | orders, order_status_history | /api/orders/[id]/status |
| Riwayat Pesanan | ✅ | ❌ | ❌ | /history | local storage | - |
| Kelola Status Order | ❌ | ✅ | Monitor | /pos | orders | /api/orders/[id]/status |
| Catatan Shift | ❌ | ✅ | Lihat | /pos/shift | shift_notes | /api/shift-notes |
| Dashboard Kasir | ❌ | ✅ | ❌ | /pos | orders | realtime |
| Dashboard Owner | ❌ | ❌ | ✅ | /owner | orders, payments | /api/reports |
| Laporan Penjualan | ❌ | ❌ | ✅ | /owner/reports | orders, payments | /api/reports |
| Export Excel/PDF | ❌ | ❌ | ✅ | /owner/reports | orders | /api/reports/export |
| Kelola Produk | ❌ | ❌ | ✅ | /owner/products | products | /api/products |
| Kelola Filter Quiz | ❌ | ❌ | ✅ | /owner/filter-chips | filter_chips | /api/filter-chips |
| Kelola Ingredients | ❌ | ❌ | ✅ | /owner/ingredients | ingredients | /api/ingredients |
| Kelola Banner | ❌ | ❌ | ✅ | /owner/banners | banners | /api/banners |
| Kelola QR Meja | ❌ | ❌ | ✅ | /owner/tables | tables | /api/tables |
| Kelola Kasir | ❌ | ❌ | ✅ | /owner/cashiers | users | /api/cashiers |
| Pengaturan Toko | ❌ | ❌ | ✅ | /owner/settings | store_settings | /api/settings |
| Aktivitas Sistem | ❌ | ❌ | ✅ | /owner/settings | activity_logs | /api/activity-logs |
| Login | ❌ | ✅ | ✅ | /login | users | /api/auth |

---

## MVP Scope

### Customer
- QR Ordering
- Filter Produk
- Quiz Rekomendasi
- Keranjang
- Checkout
- Tracking Pesanan
- Riwayat Pesanan

### Cashier
- Order Board
- Status Pesanan
- Catatan Shift

### Owner
- Dashboard
- Laporan
- Kas
- Produk
- Filter Quiz
- Banner
- QR Meja
- Kasir
- Pengaturan

---

## Future Enhancements

- Multi Cabang
- Supplier
- Purchase Order
- Loyalty Point
- Voucher
- Marketplace Integration
