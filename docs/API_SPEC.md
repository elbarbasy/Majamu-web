# API Specification (MVP) — DEPRECATED

> ⚠️ **DEPRECATED (lihat CONFLICT_RESOLUTION.md #1).**
> Dokumen ini dipertahankan hanya sebagai referensi historis.
> Spesifikasi API resmi (RESTful) ada di **`docs/ROUTES.md`** bagian "API Routes".
> Pemetaan ringkas pola lama → baru:
> - `/api/menu`, `/api/menu/:id` → `/api/products`, `/api/products/[id]`
> - `/api/cart` → state lokal (Zustand), bukan endpoint
> - `/api/checkout` → `POST /api/orders`
> - `/api/customer/history` → localStorage (bukan endpoint)
> - `/api/cashier/orders`, `/api/cashier/orders/:id/status` → `/api/orders`, `/api/orders/[id]/status`
> - `/api/cashier/shift-note` → `/api/shift-notes`
> - `/api/dashboard` → `/api/reports`
> - `/api/categories` → `/api/filter-chips`
> - `/api/payment/create`, `/api/payment/callback` → `/api/payments`, `/api/payments/callback`

---


## Customer

GET /api/menu
GET /api/menu/:id
POST /api/cart
POST /api/checkout
GET /api/orders/:id
GET /api/customer/history

## Cashier

GET /api/cashier/orders
PATCH /api/cashier/orders/:id/status
POST /api/cashier/shift-note

## Owner

GET /api/dashboard
GET /api/reports
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
POST /api/categories
POST /api/banners
POST /api/tables

## Payment

POST /api/payment/create
POST /api/payment/callback
