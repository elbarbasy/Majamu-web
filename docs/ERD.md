# Majamu ERD

## Relationship Overview

users
└── activity_logs

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

---

## Mermaid ERD

```mermaid
erDiagram

    USERS ||--o{ ACTIVITY_LOGS : creates

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
        text name
        text email
        text role
    }

    PRODUCTS {
        uuid id PK
        text name
        numeric price
        text stock_status
    }

    FILTER_CHIPS {
        uuid id PK
        text name
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
        text display_number
        text status
        numeric total_price
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

    STORE_SETTINGS {
        uuid id PK
        int urgency_threshold_minutes
        text store_status
    }
```
