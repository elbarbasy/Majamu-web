-- Majamu Consolidated Schema
-- Aligned with docs/CONFLICT_RESOLUTION.md (approved decisions #1-#13)
--
-- Auth strategy (#11): kredensial dikelola Supabase Auth (auth.users).
-- Tabel public.users hanya menyimpan profil (role, is_active) tertaut via auth_user_id.

-- Required extensions (#: SUPABASE_SETUP recommended extensions)
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- =========================================================
-- USERS (profil Owner/Kasir; kredensial di auth.users) (#11)
-- =========================================================
create table users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  role text not null check (role in ('owner','cashier')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================
-- FILTER CHIPS (alias "kategori" pada PRD) (#7)
-- =========================================================
create table filter_chips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer default 0
);

-- =========================================================
-- PRODUCTS
-- =========================================================
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text,
  description text,
  price numeric(12,2) not null,
  menu_status text default 'active' check (menu_status in ('active','inactive')),
  stock_status text default 'available' check (stock_status in ('available','out_of_stock')),
  featured_filter_chip_id uuid references filter_chips(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table product_filter_chips (
  product_id uuid references products(id) on delete cascade,
  filter_chip_id uuid references filter_chips(id) on delete cascade,
  primary key (product_id, filter_chip_id)
);

create table ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text
);

create table product_ingredients (
  product_id uuid references products(id) on delete cascade,
  ingredient_id uuid references ingredients(id) on delete cascade,
  primary key (product_id, ingredient_id)
);

-- =========================================================
-- TABLES (meja + QR)
-- =========================================================
create table tables (
  id uuid primary key default gen_random_uuid(),
  table_number integer unique not null,
  qr_url text,
  is_active boolean default true
);

-- =========================================================
-- ORDERS (+ receipt_number, receipt_url #2 ; order_type CHECK #12)
-- =========================================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  status_url text unique,
  receipt_number text unique,                       -- (#2) format MJM-YYYYMMDD-XXXX
  receipt_url text,                                 -- (#2)
  order_type text check (order_type in ('dine_in','take_away')),  -- (#12)
  table_id uuid references tables(id) on delete set null,
  display_number text,                              -- nomor meja (dine_in) / antrian (take_away)
  customer_name text,
  whatsapp text,
  notes text,
  payment_method text check (payment_method in ('cash','qris','midtrans')),
  status text not null default 'menunggu_bayar'
    check (status in ('menunggu_bayar','diterima','diracik','siap_diambil','selesai')),
  total_price numeric(12,2),
  created_at timestamptz default now()
);

create table order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  status text not null,
  changed_at timestamptz default now()
);

-- order_items.sweetness_level enum tetap 4 level (#8)
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name_snapshot text,
  price_snapshot numeric(12,2),
  sweetness_level text check (sweetness_level in ('normal','less','low','no_sugar')),  -- (#8)
  quantity integer not null,
  subtotal numeric(12,2)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  method text check (method in ('cash','qris','midtrans')),
  status text,
  amount numeric(12,2),
  paid_at timestamptz
);

-- Catatan shift kasir (selisih kas, catatan) (#6)
create table shift_notes (
  id uuid primary key default gen_random_uuid(),
  category text,
  nominal numeric(12,2),
  description text,
  created_at timestamptz default now()
);

-- =========================================================
-- CASH ENTRIES (modul Kas owner: pemasukan/pengeluaran) (#6)
-- =========================================================
create table cash_entries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income','expense')),
  category text,
  amount numeric(12,2) not null,
  description text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

create table banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text,
  is_active boolean default true
);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  action text,
  description text,
  created_at timestamptz default now()
);

-- =========================================================
-- STORE SETTINGS (+ profil toko #13)
-- =========================================================
create table store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text,                                  -- (#13)
  store_whatsapp text,                              -- (#13)
  logo_url text,                                    -- (#13)
  operational_hours jsonb,                          -- (#13) {"mon":{"open":"08:00","close":"21:00"}, ...}
  payment_methods jsonb default '["cash","qris","midtrans"]'::jsonb,  -- (#13)
  urgency_threshold_minutes integer default 7,
  store_status text default 'open' check (store_status in ('open','closed')),
  queue_counter integer default 1,
  updated_at timestamptz default now()
);

-- =========================================================
-- DAILY SEQUENCE (atomik, reset harian) untuk nomor struk &
-- nomor antrian take_away (#2, #12)
-- =========================================================
create table daily_sequences (
  seq_date date primary key default current_date,
  last_value integer not null default 0
);

create or replace function next_daily_sequence()
returns integer
language plpgsql
as $$
declare
  v integer;
begin
  insert into daily_sequences (seq_date, last_value)
  values (current_date, 1)
  on conflict (seq_date)
  do update set last_value = daily_sequences.last_value + 1
  returning last_value into v;
  return v;
end;
$$;

-- =========================================================
-- ROW LEVEL SECURITY (#9)
-- =========================================================
alter table users enable row level security;
alter table filter_chips enable row level security;
alter table products enable row level security;
alter table product_filter_chips enable row level security;
alter table ingredients enable row level security;
alter table product_ingredients enable row level security;
alter table tables enable row level security;
alter table orders enable row level security;
alter table order_status_history enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table shift_notes enable row level security;
alter table cash_entries enable row level security;
alter table banners enable row level security;
alter table activity_logs enable row level security;
alter table store_settings enable row level security;
alter table daily_sequences enable row level security;

-- Helper: peran user yang sedang login berdasarkan auth.uid()
create or replace function current_user_role()
returns text
language sql
stable
as $$
  select role from users where auth_user_id = auth.uid() and is_active = true limit 1;
$$;

-- Public read-only (#9): katalog yang dibutuhkan pelanggan tanpa login
create policy public_read_products on products for select using (true);
create policy public_read_filter_chips on filter_chips for select using (true);
create policy public_read_product_filter_chips on product_filter_chips for select using (true);
create policy public_read_ingredients on ingredients for select using (true);
create policy public_read_product_ingredients on product_ingredients for select using (true);
create policy public_read_banners on banners for select using (true);
create policy public_read_tables on tables for select using (true);
create policy public_read_store_settings on store_settings for select using (true);

-- Customer dapat membuat order & item & payment (tanpa login)
create policy public_insert_orders on orders for insert with check (true);
create policy public_insert_order_items on order_items for insert with check (true);
create policy public_insert_payments on payments for insert with check (true);
-- Order dibaca publik (untuk tracking via status_url/receipt_number di sisi aplikasi)
create policy public_read_orders on orders for select using (true);
create policy public_read_order_items on order_items for select using (true);
create policy public_read_order_status_history on order_status_history for select using (true);
create policy public_read_payments on payments for select using (true);

-- Kasir: kelola status order, shift notes
create policy cashier_update_orders on orders for update
  using (current_user_role() in ('cashier','owner'))
  with check (current_user_role() in ('cashier','owner'));
create policy staff_insert_status_history on order_status_history for insert
  with check (current_user_role() in ('cashier','owner'));
create policy staff_manage_shift_notes on shift_notes for all
  using (current_user_role() in ('cashier','owner'))
  with check (current_user_role() in ('cashier','owner'));

-- Owner: full access pada tabel manajemen
create policy owner_manage_products on products for all
  using (current_user_role() = 'owner') with check (current_user_role() = 'owner');
create policy owner_manage_filter_chips on filter_chips for all
  using (current_user_role() = 'owner') with check (current_user_role() = 'owner');
create policy owner_manage_ingredients on ingredients for all
  using (current_user_role() = 'owner') with check (current_user_role() = 'owner');
create policy owner_manage_banners on banners for all
  using (current_user_role() = 'owner') with check (current_user_role() = 'owner');
create policy owner_manage_tables on tables for all
  using (current_user_role() = 'owner') with check (current_user_role() = 'owner');
create policy owner_manage_users on users for all
  using (current_user_role() = 'owner') with check (current_user_role() = 'owner');
create policy owner_manage_cash on cash_entries for all
  using (current_user_role() = 'owner') with check (current_user_role() = 'owner');
create policy owner_manage_settings on store_settings for all
  using (current_user_role() = 'owner') with check (current_user_role() = 'owner');
create policy owner_read_activity_logs on activity_logs for select
  using (current_user_role() = 'owner');

-- User dapat membaca profilnya sendiri
create policy user_read_self on users for select
  using (auth_user_id = auth.uid() or current_user_role() = 'owner');
