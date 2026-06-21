-- Majamu MVP Schema

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text unique not null,
  created_at timestamptz default now()
);

create table tables (
  id uuid primary key default gen_random_uuid(),
  table_number integer unique not null,
  qr_url text,
  is_active boolean default true
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id),
  name text not null,
  description text,
  price numeric(12,2) not null,
  image_url text,
  is_available boolean default true,
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null,
  customer_id uuid references customers(id),
  table_id uuid references tables(id),
  status text not null default 'pending',
  subtotal numeric(12,2),
  total numeric(12,2),
  notes text,
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null,
  price numeric(12,2) not null
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  method text,
  status text,
  amount numeric(12,2),
  paid_at timestamptz
);
