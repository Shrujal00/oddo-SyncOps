# 02 — Inventory

## Tasks

### INV-01 · InventoryMovement write helper
**Status:** DONE
**Files:** `backend/src/modules/inventory/repository.ts`
**Implemented:** `recordMovement(data: RecordMovementInput)` — creates InventoryMovement row. Called by Sales/Purchase/Manufacturing (not HTTP). Also `listMovements(filters)` for paginated ledger.

### INV-02 · Inventory movement list (HTTP)
**Status:** DONE
**Files:** `backend/src/modules/inventory/service.ts`, `controller.ts`, `routes.ts`
**Implemented:** `GET /api/inventory/movements?productId=&type=&from=&to=&page=&pageSize=` — ADMIN + INVENTORY_MANAGER only. Returns paginated entries with product name/sku.

### INV-03 · Manual stock adjustment
**Status:** DONE
**Files:** `backend/src/modules/inventory/service.ts`, `controller.ts`, `routes.ts`, `validation.ts`, `dto.ts`
**Implemented:** `POST /api/inventory/adjustments` — body: `{ productId, quantityDelta (signed int), reason }`. `adjustedBy` injected from JWT (`req.user.sub`). Writes ADJUSTMENT movement + AuditLog (eventType: INVENTORY_CHANGED).

### FE-INV-01 · Inventory page
**Status:** TODO
**Files:** `frontend/src/app/(erp)/inventory/page.tsx`
**What to implement:**
- useQuery to fetch GET /api/inventory/movements (with token from useAppStore)
- Table: Product Name | Type badge | Qty (signed display) | Reference | Date
- Filter bar: productId input, type select, from/to date inputs
- Manual adjustment form — show only if role is ADMIN or INVENTORY_MANAGER
  - Fields: productId (text/select), quantityDelta (number, signed), reason (text)
  - POST /api/inventory/adjustments
- Use apiFetch from `frontend/src/lib/api.ts`
- Tailwind design tokens: accent=#714B67, bg=white, surface=#F8F7F5, border=#E5E7EB
