# Phase 03 — Products & Inventory

**Status:** IN_PROGRESS
**Owner:** Teesha-Gokulgandhi (backend) · Shrujal00 (frontend)
**Depends on:** Phase 02

## Goal
Product CRUD with live stock quantities. Inventory movement ledger. Products page functional.

## Backend Tasks

### PROD-01 · Stock compute helper — **DONE**
`backend/src/modules/inventory/repository.ts`
- `getStockSummary(productId)` — PURCHASE+PRODUCTION positive, SALE+CONSUMPTION negative, ADJUSTMENT signed
- `reservedQty` from CONFIRMED/PARTIALLY_DELIVERED SalesOrderItems
- `freeToUseQty = onHandQty - reservedQty`

### PROD-02 · Products list + get — **DONE**
`GET /api/products?sku=&name=&lowStockOnly=true`
`GET /api/products/:id`
Both responses include `{ onHandQty, reservedQty, freeToUseQty }`
Auth required. All authenticated roles can read.

### PROD-03 · Product create + update — **DONE**
`POST /api/products` — ADMIN / BUSINESS_OWNER only
`PATCH /api/products/:id` — ADMIN / BUSINESS_OWNER only
Validates `activeBomId` and `preferredVendorId` existence.
Validation schema includes procurement config fields.

### INV-01 · Movement write helper (internal) — **DONE**
`backend/src/modules/inventory/repository.ts` → `recordMovement(data)`
Internal — not a public HTTP endpoint.

### INV-02 · Inventory movements list — **DONE**
`GET /api/inventory/movements?productId=&type=&from=&to=` — paginated
INVENTORY_MANAGER + ADMIN only.

### INV-03 · Manual stock adjustment — **DONE**
`POST /api/inventory/adjustments`
INVENTORY_MANAGER + ADMIN only. `adjustedBy` injected from JWT (not in request body).
Writes ADJUSTMENT movement + AuditLog row.

### PARTY-01 · Customer + Vendor CRUD — **DONE**
`GET/POST/PATCH /api/customers` — read: all auth; write: ADMIN, SALES_USER, BUSINESS_OWNER
`GET/POST/PATCH /api/vendors` — read: all auth; write: ADMIN, PURCHASE_USER, BUSINESS_OWNER
New modules at `backend/src/modules/customers/` and `backend/src/modules/vendors/`
Registered in `backend/src/routes/index.ts`

## Frontend Tasks

### FE-PROD-01 · Products page — **TODO** (NEXT)
`frontend/src/app/(erp)/products/page.tsx`
- Table: SKU | Name | Unit | On Hand | Reserved | Free to Use | Reorder Point
- Highlight rows where `freeToUseQty < reorderPoint` (low stock)
- Create / Edit modal with all product fields including procurement config
- Role-gated create button (Admin / Business Owner only)
- API client at `frontend/src/lib/api.ts` — `apiFetch<T>(path, { token, ...fetchInit })`

### FE-INV-01 · Inventory page — **TODO** (NEXT)
`frontend/src/app/(erp)/inventory/page.tsx`
- Movement ledger table: Product | Type | Qty | Reference | Date
- Filter by product, type, date range
- Manual adjustment form (Inventory Manager + Admin only)

## Done Criteria
- [x] `GET /api/products` returns stock quantities computed from movements
- [ ] Create product, then add purchase movement — on-hand updates (needs FE test)
- [ ] Low stock filter works (needs FE test)
- [ ] Frontend products table shows live stock
- [ ] Inventory movement list paginates correctly (backend done, FE TODO)
