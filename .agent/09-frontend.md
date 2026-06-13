# 09 — Frontend

## Stack
Next.js 15 App Router · TypeScript · Tailwind · shadcn/ui · TanStack Query · Zustand

## Tasks

### FE-01 · Auth flow
**Status:** TODO  
**Files:** `frontend/src/features/auth/`, `app/(auth)/login/page.tsx`  
**What to implement:**
- Login form → POST `/api/auth/login` → store JWT in Zustand + localStorage
- Auth middleware in Next.js (`middleware.ts`) to protect `(dashboard)` and `(erp)` routes
- Redirect unauthenticated → `/login`

### FE-02 · Dashboard page
**Status:** TODO  
**Files:** `frontend/src/app/(dashboard)/overview/page.tsx`  
**What to implement:**
- Stat cards: Total Sales Orders, Pending Deliveries, MOs in progress, Low Stock alerts
- Fetch from `GET /api/dashboard`

### FE-03 · Products page
**Status:** TODO  
**Files:** `frontend/src/app/(erp)/products/page.tsx`, `frontend/src/features/products/`  
**What to implement:**
- Table: SKU, Name, On Hand, Reserved, Free to Use, Reorder Point
- Create/Edit modal with procurement config fields
- Low stock rows highlighted

### FE-04 · Sales page
**Status:** TODO  
**Files:** `frontend/src/app/(erp)/sales/page.tsx`  
**What to implement:**
- Sales order list with status badges
- Create order flow (select customer + line items)
- Confirm / Deliver / Cancel actions

### FE-05 · Purchases page
**Status:** TODO  
**What to implement:**
- PO list, create PO, confirm, receive (partial form), cancel

### FE-06 · Manufacturing page
**Status:** TODO  
**What to implement:**
- MO list, create MO (auto-loads BoM), status transitions
- Work order steps view per MO

### FE-07 · BoM page
**Status:** TODO  
**What to implement:**
- BoM list by product, create/edit BoM with component lines + operations

### FE-08 · Inventory page
**Status:** TODO  
**What to implement:**
- Movement ledger table (filterable by product, type, date)
- Manual adjustment form (Inventory Manager only)

### FE-09 · Audit page
**Status:** TODO  
**What to implement:**
- Audit log table, filterable by entity, event type, date range

### FE-10 · API client wiring
**Status:** TODO  
**Files:** `frontend/src/services/api-client.ts`  
**What to implement:**
- Axios/fetch wrapper that injects JWT from store
- Per-feature query hooks in each `features/*/index.ts`
