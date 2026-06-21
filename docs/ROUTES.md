# Majamu Routes

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

### Order Tracking
- /order/[statusUrl]
- /history

---

## Cashier Routes

### POS
- /pos
- /pos/orders
- /pos/completed
- /pos/shift

### Status Tabs
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

## API Routes

### Orders
- /api/orders
- /api/orders/[id]
- /api/orders/[id]/status

### Products
- /api/products
- /api/products/[id]

### Quiz
- /api/filter-chips
- /api/recommendations

### Tables
- /api/tables

### Payments
- /api/payments

### Reports
- /api/reports

### Settings
- /api/settings
