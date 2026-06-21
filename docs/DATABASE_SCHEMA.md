# Majamu Database Schema (PRD Aligned)

> Diselaraskan dengan keputusan di `CONFLICT_RESOLUTION.md`.
> Total: **16 tabel** + 1 tabel utilitas (`daily_sequences`).
> Auth memakai Supabase Auth; tabel `users` hanya profil (lihat #11).

## users
- id
- auth_user_id (FK auth.users — Supabase Auth) (#11)
- name
- email
- role (owner, cashier)
- is_active
- created_at
- updated_at

## filter_chips
- id
- name
- sort_order

> Catatan: "kategori" pada PRD = `filter_chips` (#7).

## products
- id
- name
- photo_url
- description
- price
- menu_status (active, inactive)
- stock_status (available, out_of_stock)
- featured_filter_chip_id (FK filter_chips)
- created_at
- updated_at

## product_filter_chips
- product_id
- filter_chip_id

## ingredients
- id
- name
- category

## product_ingredients
- product_id
- ingredient_id

## tables
- id
- table_number
- qr_url
- is_active

## orders
- id
- status_url
- receipt_number (unique, format MJM-YYYYMMDD-XXXX) (#2)
- receipt_url (#2)
- order_type (dine_in, take_away) (#12)
- table_id (FK tables) (#12)
- display_number (nomor meja untuk dine_in / nomor antrian untuk take_away)
- customer_name
- whatsapp
- notes
- payment_method (cash, qris, midtrans)
- status (menunggu_bayar, diterima, diracik, siap_diambil, selesai)
- total_price
- created_at

## order_status_history
- id
- order_id
- status
- changed_at

## order_items
- id
- order_id
- product_id
- product_name_snapshot
- price_snapshot
- sweetness_level (normal, less, low, no_sugar) (#8)
- quantity
- subtotal

## payments
- id
- order_id
- method (cash, qris, midtrans)
- status
- amount
- paid_at

## shift_notes
- id
- category
- nominal
- description
- created_at

## cash_entries (#6)
- id
- type (income, expense)
- category
- amount
- description
- created_by (FK users)
- created_at

## banners
- id
- title
- image_url
- is_active

## activity_logs
- id
- user_id
- action
- description
- created_at

## store_settings
- id
- store_name (#13)
- store_whatsapp (#13)
- logo_url (#13)
- operational_hours (jsonb) (#13)
- payment_methods (jsonb) (#13)
- urgency_threshold_minutes
- store_status (open, closed)
- queue_counter
- updated_at

## daily_sequences (utilitas, atomik harian) (#2, #12)
- seq_date (PK)
- last_value

> Fungsi `next_daily_sequence()` mengembalikan nilai urut harian (reset tiap hari),
> dipakai untuk `XXXX` pada `receipt_number` dan nomor antrian `take_away`.
