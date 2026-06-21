# Majamu Project Structure

## Technology Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- Zustand
- React Hook Form
- Zod
- Lucide Icons

---

## Root Structure

```text
src/
├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── services/
├── stores/
├── types/
├── actions/
└── constants/
```

---

## App Router

```text
src/app/
├── (customer)/
├── (cashier)/
├── (owner)/
├── api/
├── layout.tsx
├── loading.tsx
├── error.tsx
└── not-found.tsx
```

---

## Customer Module

```text
(customer)
├── page.tsx
├── table/[tableNumber]/page.tsx
├── quiz/page.tsx
├── cart/page.tsx
├── checkout/page.tsx
├── history/page.tsx
└── order/[statusUrl]/page.tsx
```

---

## Cashier Module

```text
(cashier)
├── pos/page.tsx
├── pos/completed/page.tsx
└── pos/shift/page.tsx
```

---

## Owner Module

```text
(owner)
├── owner/page.tsx
├── owner/reports/page.tsx
├── owner/cash/page.tsx
├── owner/products/page.tsx
├── owner/filter-chips/page.tsx
├── owner/ingredients/page.tsx
├── owner/banners/page.tsx
├── owner/tables/page.tsx
├── owner/cashiers/page.tsx
└── owner/settings/page.tsx
```

---

## Components

```text
components/
├── ui/
├── customer/
├── cashier/
├── owner/
├── shared/
└── layouts/
```

---

## Features

```text
features/
├── auth/
├── products/
├── orders/
├── payments/
├── quiz/
├── reports/
├── tables/
├── banners/
├── cashier/
└── owner/
```

---

## Stores

```text
stores/
├── cart-store.ts
├── active-order-store.ts
├── customer-history-store.ts
├── auth-store.ts
├── settings-store.ts
├── owner-dashboard-store.ts
└── cashier-board-store.ts
```

---

## Services

```text
services/
├── products.service.ts
├── orders.service.ts
├── payments.service.ts
├── reports.service.ts
├── tables.service.ts
└── settings.service.ts
```

---

## Database

```text
supabase/
├── schema.sql
├── seed.sql
└── migrations/
```

---

## Assets

```text
public/
├── images/
├── banners/
├── products/
└── icons/
```

---

## Development Rules

- Mobile First
- Responsive Design
- Type Safe
- Feature Based Structure
- Reusable Components
- Supabase Realtime Ready
- PWA Ready
- QR Ordering Optimized
