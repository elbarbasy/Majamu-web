-- Majamu Seed Data
-- Aligned with docs/CONFLICT_RESOLUTION.md (#10) & SUPABASE_SETUP.md "Initial Data"
--
-- Urutan: filter_chips -> products -> relasi -> ingredients -> banners -> tables
--         -> store_settings -> owner profile.

-- =========================================================
-- 1. FILTER CHIPS (11 chip sesuai CUSTOMER_UI.md, urut via sort_order)
--    Catatan: "Semua" & "Rekomendasi" adalah filter virtual di UI,
--    tetap diseed agar konsisten dengan dokumentasi.
-- =========================================================
insert into filter_chips (name, sort_order) values
  ('Semua', 0),
  ('Rekomendasi', 1),
  ('Daya Tahan Tubuh', 2),
  ('Pencernaan Nyaman', 3),
  ('Pegal & Capek', 4),
  ('Tenang & Tidur Nyenyak', 5),
  ('Batuk & Tenggorokan', 6),
  ('Kulit Sehat', 7),
  ('Stamina & Energi', 8),
  ('Nyaman di Hari Spesial', 9),
  ('Susu & Soda Jamu', 10);

-- =========================================================
-- 2. PRODUCTS (contoh jamu) + featured chip
-- =========================================================
insert into products (name, description, price, featured_filter_chip_id) values
  ('Kunyit Asam Segar', 'Jamu klasik kunyit asam untuk pencernaan & kesegaran tubuh.', 15000,
    (select id from filter_chips where name = 'Pencernaan Nyaman')),
  ('Beras Kencur Hangat', 'Menambah stamina dan meredakan pegal setelah aktivitas.', 15000,
    (select id from filter_chips where name = 'Pegal & Capek')),
  ('Jahe Merah Madu', 'Menghangatkan badan, baik untuk tenggorokan & daya tahan tubuh.', 18000,
    (select id from filter_chips where name = 'Daya Tahan Tubuh')),
  ('Wedang Uwuh Rempah', 'Racikan rempah hangat untuk relaksasi dan tidur nyenyak.', 20000,
    (select id from filter_chips where name = 'Tenang & Tidur Nyenyak')),
  ('Temulawak Sehat', 'Mendukung fungsi hati dan menjaga nafsu makan.', 16000,
    (select id from filter_chips where name = 'Daya Tahan Tubuh')),
  ('Susu Jahe Jamu', 'Perpaduan susu dan jahe, lembut dan menghangatkan.', 22000,
    (select id from filter_chips where name = 'Susu & Soda Jamu'));

-- Relasi product_filter_chips (tagging)
insert into product_filter_chips (product_id, filter_chip_id)
select p.id, c.id from products p, filter_chips c
where (p.name = 'Kunyit Asam Segar' and c.name in ('Rekomendasi','Pencernaan Nyaman','Kulit Sehat'))
   or (p.name = 'Beras Kencur Hangat' and c.name in ('Pegal & Capek','Stamina & Energi'))
   or (p.name = 'Jahe Merah Madu' and c.name in ('Rekomendasi','Daya Tahan Tubuh','Batuk & Tenggorokan'))
   or (p.name = 'Wedang Uwuh Rempah' and c.name in ('Tenang & Tidur Nyenyak'))
   or (p.name = 'Temulawak Sehat' and c.name in ('Daya Tahan Tubuh','Stamina & Energi'))
   or (p.name = 'Susu Jahe Jamu' and c.name in ('Susu & Soda Jamu','Batuk & Tenggorokan'));

-- =========================================================
-- 3. INGREDIENTS + relasi product_ingredients
-- =========================================================
insert into ingredients (name, category) values
  ('Kunyit', 'rimpang'),
  ('Asam Jawa', 'buah'),
  ('Beras', 'biji'),
  ('Kencur', 'rimpang'),
  ('Jahe Merah', 'rimpang'),
  ('Madu', 'pemanis'),
  ('Gula Aren', 'pemanis'),
  ('Temulawak', 'rimpang'),
  ('Cengkeh', 'rempah'),
  ('Kayu Manis', 'rempah'),
  ('Susu', 'olahan');

insert into product_ingredients (product_id, ingredient_id)
select p.id, i.id from products p, ingredients i
where (p.name = 'Kunyit Asam Segar' and i.name in ('Kunyit','Asam Jawa','Gula Aren'))
   or (p.name = 'Beras Kencur Hangat' and i.name in ('Beras','Kencur','Gula Aren'))
   or (p.name = 'Jahe Merah Madu' and i.name in ('Jahe Merah','Madu'))
   or (p.name = 'Wedang Uwuh Rempah' and i.name in ('Cengkeh','Kayu Manis','Jahe Merah','Gula Aren'))
   or (p.name = 'Temulawak Sehat' and i.name in ('Temulawak','Gula Aren'))
   or (p.name = 'Susu Jahe Jamu' and i.name in ('Susu','Jahe Merah','Madu'));

-- =========================================================
-- 4. BANNERS
-- =========================================================
insert into banners (title, image_url, is_active) values
  ('Selamat Datang di Majamu', '/banners/welcome.jpg', true),
  ('Promo Jamu Hangat Hari Ini', '/banners/promo-hangat.jpg', true);

-- =========================================================
-- 5. TABLES (Meja 1-20)
-- =========================================================
insert into tables (table_number, is_active)
select gs, true from generate_series(1, 20) as gs;

-- =========================================================
-- 6. STORE SETTINGS (baris tunggal)
-- =========================================================
insert into store_settings (store_name, store_whatsapp, store_status, urgency_threshold_minutes)
values ('Majamu', '628000000000', 'open', 7);

-- =========================================================
-- 7. OWNER ACCOUNT (#11 Supabase Auth)
-- =========================================================
-- Kredensial owner dibuat lewat Supabase Auth (Dashboard > Authentication,
-- atau admin API), BUKAN di tabel ini. Setelah user auth dibuat, ambil UUID-nya
-- dan jalankan insert profil berikut (ganti <AUTH_USER_UUID>):
--
-- insert into users (auth_user_id, name, email, role, is_active)
-- values ('<AUTH_USER_UUID>', 'Owner', 'owner@majamu.local', 'owner', true);
