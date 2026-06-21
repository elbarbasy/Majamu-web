# Majamu Routes

> Diselaraskan dengan `CONFLICT_RESOLUTION.md`. Konvensi API: **RESTful** (#1).
> `docs/API_SPEC.md` ditandai deprecated.

## Auth Routes (#4)

- /login            # satu form; redirect by role (owner -> /owner, cashier -> /pos)

---

## Public Customer Routes

### Entry
- /
- /table/[tableNumber]

### Product Discovery
- /quiz
- /product/[productId]

### Ordering
- /cart
- /checkout

### Receipt (#2)
- /receipt/[receiptNumber]

### Order Tracking
- /order/[statusUrl]
- /history

---

## Cashier Routes

### POS
- /pos                # board + tab status (tab, bukan route) (#5)
- /pos/completed
- /pos/shift

### Status Tabs (filter di dalam /pos, bukan route)
- Semua
- Menunggu Bayar
- Diterima
- Diracik
- Siap Diambil

---

## Owner Routes

### Dashboard
- /owner

### Reports
- /owner/reports

### Cash
- /owner/cash

### Product Management
- /owner/products
- /owner/filter-chips
- /owner/ingredients
- /owner/banners

### QR Management
- /owner/tables

### Cashier Management
- /owner/cashiers

### Settings
- /owner/settings

---

## API Routes (RESTful #1)

### Auth
- /api/auth                       # POST login, DELETE logout

### Orders
- /api/orders                     # GET (kasir/owner), POST (checkout)
- /api/orders/[id]
- /api/orders/[id]/status         # PATCH

### Products
- /api/products
- /api/products/[id]

### Quiz
- /api/filter-chips
- /api/recommendations            # POST jawaban quiz -> produk

### Ingredients
- /api/ingredients

### Tables
- /api/tables

### Banners
- /api/banners

### Cashiers
- /api/cashiers

### Shift Notes
- /api/shift-notes

### Cash (#6)
- /api/cash

### Payments
- /api/payments
- /api/payments/callback          # webhook Midtrans

### Receipts (#2)
- /api/receipts/[receiptNumber]

### Reports
- /api/reports
- /api/reports/export             # Excel/PDF

### Settings
- /api/settings

### Activity Logs
- /api/activity-logs
