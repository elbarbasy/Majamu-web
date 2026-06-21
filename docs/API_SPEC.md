# API Specification (MVP)

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
