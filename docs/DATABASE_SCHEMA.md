# Majamu Database Schema (MVP)

## Tables

### users
- id
- name
- email
- role (owner, cashier)
- created_at

### customers
- id
- name
- phone
- created_at

### tables
- id
- table_number
- qr_url
- is_active

### categories
- id
- name
- slug

### products
- id
- category_id
- name
- description
- price
- image_url
- is_available

### orders
- id
- order_code
- customer_id
- table_id
- status
- subtotal
- total
- notes
- created_at

### order_items
- id
- order_id
- product_id
- quantity
- price

### payments
- id
- order_id
- method
- status
- amount
- paid_at

### shift_notes
- id
- user_id
- note
- created_at

### banners
- id
- title
- image_url
- is_active

### settings
- id
- key
- value

## Order Status
- pending
- confirmed
- preparing
- ready
- completed
- cancelled
