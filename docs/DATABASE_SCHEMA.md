# Majamu Database Schema (PRD Aligned)

## users
- id
- name
- email
- password_hash
- role (owner, cashier)
- is_active
- created_at
- updated_at

## products
- id
- name
- photo_url
- description
- price
- menu_status
- stock_status
- featured_filter_chip_id
- created_at
- updated_at

## filter_chips
- id
- name
- sort_order

## product_filter_chips
- product_id
- filter_chip_id

## ingredients
- id
- name
- category

## product_ingredients
- product_id
- ingredient_id

## tables
- id
- table_number
- qr_url
- is_active

## orders
- id
- status_url
- order_type
- display_number
- customer_name
- whatsapp
- notes
- payment_method
- status
- total_price
- created_at

## order_status_history
- id
- order_id
- status
- changed_at

## order_items
- id
- order_id
- product_id
- product_name_snapshot
- price_snapshot
- sweetness_level
- quantity
- subtotal

## payments
- id
- order_id
- method
- status
- amount
- paid_at

## shift_notes
- id
- category
- nominal
- description
- created_at

## banners
- id
- title
- image_url
- is_active

## activity_logs
- id
- user_id
- action
- description
- created_at

## store_settings
- id
- urgency_threshold_minutes
- store_status
- queue_counter
- updated_at
