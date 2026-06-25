-- =============================================================
-- FIX: Login jadi kasir + /owner tanpa login + upload gagal
-- Jalankan di Supabase SQL Editor (seluruh isi file ini sekaligus).
-- =============================================================

-- 1) Fix chicken-egg RLS problem pada tabel users.
--    Tambah policy agar user yang login bisa baca row-nya sendiri
--    (diperlukan agar auth.service bisa membaca role setelah login).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'auth_read_users' AND tablename = 'users'
  ) THEN
    CREATE POLICY auth_read_users ON users FOR SELECT
      TO authenticated
      USING (auth_user_id = auth.uid());
  END IF;
END $$;

-- 2) Pastikan akun owner ADA di tabel users.
--    Ganti <UUID> dan <EMAIL> di bawah dengan data Anda:
--    UUID = buka Authentication > Users > klik user > kolom UID
--    EMAIL = email yang Anda pakai login
--
--    UNCOMMENT dan EDIT baris di bawah:
--
-- INSERT INTO users (auth_user_id, name, email, role, is_active)
-- VALUES (
--   'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  -- UUID dari Auth
--   'Owner',
--   'email@anda.com',
--   'owner',   -- <<< HARUS 'owner'
--   true
-- ) ON CONFLICT (auth_user_id) DO UPDATE SET role = 'owner', is_active = true;

-- 3) Verifikasi: cek isi tabel users (harusnya ada 1+ row, role = 'owner')
SELECT id, auth_user_id, name, email, role, is_active FROM users;

-- 4) Fix RLS cash_sessions (agar Buka/Tutup Toko berfungsi)
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'staff_manage_cash_sessions'
  ) THEN
    CREATE POLICY staff_manage_cash_sessions ON cash_sessions FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('cashier','owner') AND is_active)
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('cashier','owner') AND is_active)
      );
  END IF;
END $$;

-- 5) Fix daily_sequences (agar nomor struk bisa digenerate publik)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'public_manage_daily_sequences'
  ) THEN
    CREATE POLICY public_manage_daily_sequences ON daily_sequences FOR ALL
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 6) STORAGE: buat bucket + policy (upload gambar produk & banner)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy baca publik
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'storage_public_read_products' AND tablename = 'objects'
  ) THEN
    CREATE POLICY storage_public_read_products ON storage.objects
      FOR SELECT USING (bucket_id = 'products');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'storage_public_read_banners' AND tablename = 'objects'
  ) THEN
    CREATE POLICY storage_public_read_banners ON storage.objects
      FOR SELECT USING (bucket_id = 'banners');
  END IF;
END $$;

-- Policy upload (authenticated)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'storage_auth_upload_products' AND tablename = 'objects'
  ) THEN
    CREATE POLICY storage_auth_upload_products ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'products');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'storage_auth_upload_banners' AND tablename = 'objects'
  ) THEN
    CREATE POLICY storage_auth_upload_banners ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'banners');
  END IF;
END $$;

-- 7) Verifikasi storage buckets
SELECT id, name, public FROM storage.buckets WHERE id IN ('products','banners');

-- 8) Seed store_settings (agar app punya data default)
INSERT INTO store_settings (store_name, store_status)
VALUES ('Majamu', 'open')
ON CONFLICT DO NOTHING;

-- DONE! Setelah ini:
-- a) UNCOMMENT & jalankan INSERT users (langkah 2) dengan UUID Anda.
-- b) Redeploy Vercel (agar middleware menggunakan env terbaru).
-- c) Hard refresh browser (Ctrl+Shift+R) untuk bypass cache.


-- =========================================================
-- FIX: Kolom payment_code untuk QR scan pembayaran tunai
-- =========================================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_code text UNIQUE;
