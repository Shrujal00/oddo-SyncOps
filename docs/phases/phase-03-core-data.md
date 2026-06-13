# Phase 03 — Products & Inventory

**Status:** TODO  
**Owner:** Teesha-Gokulgandhi (backend) · Shrujal00 (frontend)  
**Depends on:** Phase 02  

## Goal
Product CRUD with live stock quantities. Inventory movement ledger. Products page functional.

## Backend Tasks

### PROD-01 · Stock compute helper
`backend/src/modules/inventory/repository.ts`

```ts
async getStockSummary(productId: string): Promise<{
  onHandQty: number;
  reservedQty: number;
  freeToUseQty: number;
}>
```

- `onHandQty`: SUM movements (PURCHASE + PRODUCTION = positive, SALE + CONSUMPTION = negative)
- `reservedQty`: SUM undelivered qty from CONFIRMED/PARTIALLY_DELIVERED SalesOrderItems + active MO component demand
- `freeToUseQty`: onHandQty − reservedQty

### PROD-02 · Products list + get
`GET /api/products` — filterable by `sku`, `name`, `lowStockOnly` (freeToUseQty < reorderPoint)  
`GET /api/products/:id`  
Both responses include `{ onHandQty, reservedQty, freeToUseQty }`

### PROD-03 · Product create + update
`POST /api/products` — Admin / Business Owner only  
`PATCH /api/products/:id`  
Validate `activeBomId` existence if provided. Validate `preferredVendorId` existence if provided.

### INV-01 · Movement write helper (internal)
`backend/src/modules/inventory/repository.ts`

```ts
async recordMovement(data: RecordMovementInput): Promise<void>
```

Called by Sales deliver, Purchase receive, Manufacturing complete. Never a public HTTP endpoint.

### INV-02 · Inventory movements list
`GET /api/inventory/movements?productId=&type=&from=&to=` — paginated  
Inventory Manager + Admin only

### INV-03 · Manual stock adjustment
`POST /api/inventory/adjustments`  
Inventory Manager only. Creates ADJUSTMENT movement. Writes AuditLog.

### PARTY-01 · Customer + Vendor CRUD
`GET/POST/PATCH /api/customers`  
`GET/POST/PATCH /api/vendors`  
Needed for sales orders (customer) and purchase orders (vendor).  
Add modules or extend existing stubs.

## Frontend Tasks

### FE-PROD-01 · Products page
`frontend/src/app/(erp)/products/page.tsx`
- Table: SKU | Name | Unit | On Hand | Reserved | Free to Use | Reorder Point
- Highlight rows where `freeToUseQty < reorderPoint` (low stock)
- Create / Edit modal with all product fields including procurement config
- Role-gated create button (Admin / Business Owner only)

### FE-INV-01 · Inventory page
`frontend/src/app/(erp)/inventory/page.tsx`
- Movement ledger table: Product | Type | Qty | Reference | Date
- Filter by product, type, date range
- Manual adjustment form (Inventory Manager only)

## Done Criteria
- [ ] `GET /api/products` returns stock quantities computed from movements
- [ ] Create product, then add purchase movement — on-hand updates
- [ ] Low stock filter works
- [ ] Frontend products table shows live stock
- [ ] Inventory movement list paginates correctly
