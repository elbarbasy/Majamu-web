-- =========================================================
-- FIX: RLS infinite recursion ("stack depth limit exceeded")
-- =========================================================
-- Gejala: UPDATE orders (mis. saat kasir "Terima Pembayaran") gagal dengan
-- error "stack depth limit exceeded", padahal SELECT/lookup berhasil.
--
-- Penyebab: fungsi current_user_role() membaca tabel `users`, sementara
-- policy RLS pada `users` memanggil current_user_role() lagi → rekursi.
--
-- Solusi: jadikan current_user_role() SECURITY DEFINER agar membaca `users`
-- dengan hak pemilik (melewati RLS), sehingga rekursi terputus.
--
-- Jalankan di Supabase Dashboard → SQL Editor.

create or replace function current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from users where auth_user_id = auth.uid() and is_active = true limit 1;
$$;

-- (Opsional, memastikan kolom & status valid sudah ada)
alter table orders add column if not exists payment_code text unique;
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('menunggu_bayar','diterima','diracik','siap_diambil','selesai','dibatalkan'));

-- (Opsional, aktifkan Realtime agar update lintas perangkat instan)
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_status_history;
