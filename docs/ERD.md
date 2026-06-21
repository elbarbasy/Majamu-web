# Majamu ERD

> Diselaraskan dengan `CONFLICT_RESOLUTION.md`. Penambahan: `cash_entries`,
> `users.auth_user_id` (Supabase Auth), `orders.table_id`/`receipt_number`.

## Relationship Overview

auth.users (Supabase Auth)
└── users (profil owner/kasir via auth_user_id)
    ├── activity_logs
    └── cash_entries

filter_chips
└── product_filter_chips
    └── products
        └── product_ingredients
            └── ingredients

tables
└── orders
    ├── order_items
    ├── payments
    └── order_status_history

store_settings
shift_notes
banners
daily_sequences

---

## Mermaid ERD

```mermaid
erDiagram

    AUTH_USERS ||--o| USERS : authenticates
    USERS ||--o{ ACTIVITY_LOGS : creates
    USERS ||--o{ CASH_ENTRIES : records

    FILTER_CHIPS ||--o{ PRODUCT_FILTER_CHIPS : contains
    PRODUCTS ||--o{ PRODUCT_FILTER_CHIPS : tagged_with

    PRODUCTS ||--o{ PRODUCT_INGREDIENTS : contains
    INGREDIENTS ||--o{ PRODUCT_INGREDIENTS : used_in

    TABLES ||--o{ ORDERS : receives

    ORDERS ||--o{ ORDER_ITEMS : has
    PRODUCTS ||--o{ ORDER_ITEMS : ordered_as

    ORDERS ||--o{ PAYMENTS : paid_by

    ORDERS ||--o{ ORDER_STATUS_HISTORY : tracks

    USERS {
        uuid id PK
        uuid auth_user_id FK
        text name
        text email
        text role
        bool is_active
    }

    PRODUCTS {
        uuid id PK
        text name
        numeric price
        text menu_status
        text stock_status
    }

    FILTER_CHIPS {
        uuid id PK
        text name
        int sort_order
    }

    INGREDIENTS {
        uuid id PK
        text name
        text category
    }

    TABLES {
        uuid id PK
        int table_number
    }

    ORDERS {
        uuid id PK
        text status_url
        text receipt_number
        text order_type
        uuid table_id FK
        text display_number
        text status
        numeric total_price
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        text sweetness_level
        int quantity
        numeric subtotal
    }

    PAYMENTS {
        uuid id PK
        text method
        text status
    }

    SHIFT_NOTES {
        uuid id PK
        text category
        numeric nominal
    }

    CASH_ENTRIES {
        uuid id PK
        text type
        numeric amount
        text category
    }

    STORE_SETTINGS {
        uuid id PK
        text store_name
        int urgency_threshold_minutes
        text store_status
        jsonb payment_methods
    }
```
