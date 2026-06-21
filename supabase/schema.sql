-- Majamu Consolidated Schema

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('owner','cashier')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table filter_chips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer default 0
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text,
  description text,
  price numeric(12,2) not null,
  menu_status text default 'active',
  stock_status text default 'available',
  featured_filter_chip_id uuid,
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

create table tables (
  id uuid primary key default gen_random_uuid(),
  table_number integer unique not null,
  qr_url text,
  is_active boolean default true
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  status_url text unique,
  order_type text,
  display_number text,
  customer_name text,
  whatsapp text,
  notes text,
  payment_method text,
  status text not null default 'menunggu_bayar',
  total_price numeric(12,2),
  created_at timestamptz default now()
);

create table order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  status text not null,
  changed_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name_snapshot text,
  price_snapshot numeric(12,2),
  sweetness_level text,
  quantity integer not null,
  subtotal numeric(12,2)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  method text,
  status text,
  amount numeric(12,2),
  paid_at timestamptz
);

create table shift_notes (
  id uuid primary key default gen_random_uuid(),
  category text,
  nominal numeric(12,2),
  description text,
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

create table store_settings (
  id uuid primary key default gen_random_uuid(),
  urgency_threshold_minutes integer default 7,
  store_status text default 'open',
  queue_counter integer default 1,
  updated_at timestamptz default now()
);