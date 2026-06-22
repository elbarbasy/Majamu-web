-- =============================================================
-- FIX: Filter & Komposisi tidak tersimpan saat tambah produk
-- Jalankan di Supabase SQL Editor.
-- =============================================================

-- Masalah: tabel product_filter_chips & product_ingredients hanya punya
-- policy SELECT (read). Tidak ada policy INSERT/DELETE → RLS memblokir
-- saat Owner menyimpan relasi produk-filter dan produk-ingredient.

-- 1) Tambah policy INSERT/UPDATE/DELETE pada product_filter_chips
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'staff_manage_product_filter_chips'
  ) THEN
    CREATE POLICY staff_manage_product_filter_chips ON product_filter_chips FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('owner','cashier') AND is_active)
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('owner','cashier') AND is_active)
      );
  END IF;
END $$;

-- 2) Tambah policy INSERT/UPDATE/DELETE pada product_ingredients
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'staff_manage_product_ingredients'
  ) THEN
    CREATE POLICY staff_manage_product_ingredients ON product_ingredients FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('owner','cashier') AND is_active)
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('owner','cashier') AND is_active)
      );
  END IF;
END $$;

-- 3) Pastikan policy owner_manage_filter_chips & owner_manage_ingredients ada
-- (agar Owner bisa INSERT filter/ingredient baru via ensureChipsExist/ensureIngredientsExist)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'owner_manage_filter_chips'
  ) THEN
    CREATE POLICY owner_manage_filter_chips ON filter_chips FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'owner' AND is_active)
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'owner' AND is_active)
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'owner_manage_ingredients'
  ) THEN
    CREATE POLICY owner_manage_ingredients ON ingredients FOR ALL
      USING (
        EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'owner' AND is_active)
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'owner' AND is_active)
      );
  END IF;
END $$;

-- 4) Verifikasi
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE tablename IN ('product_filter_chips', 'product_ingredients', 'filter_chips', 'ingredients')
ORDER BY tablename, policyname;

-- Setelah ini, coba tambah produk dengan filter & komposisi di Owner Dashboard.
