# 01 — Products

## Tasks

### PROD-01 · Stock compute helper
**Status:** DONE
**Files:** `backend/src/modules/inventory/repository.ts`
**Implemented:** `getStockSummary(productId)` — groups by movementType, PURCHASE/PRODUCTION positive, SALE/CONSUMPTION negative, ADJUSTMENT signed. reservedQty from confirmed SO items.

### PROD-02 · Products list + get
**Status:** DONE
**Files:** `backend/src/modules/products/repository.ts`, `service.ts`, `controller.ts`, `routes.ts`
**Implemented:** GET /api/products (filters: sku, name, lowStockOnly), GET /api/products/:id. Auth required via `authenticateRequest` middleware on all routes.

### PROD-03 · Product create + update
**Status:** DONE
**Files:** `backend/src/modules/products/repository.ts`, `service.ts`, `controller.ts`, `routes.ts`, `validation.ts`
**Implemented:** POST/PATCH with RBAC (ADMIN, BUSINESS_OWNER). Validation schema updated with procurement fields. Validates preferredVendorId and activeBomId existence.

### FE-PROD-01 · Products page
**Status:** TODO
**Files:** `frontend/src/app/(erp)/products/page.tsx`
**What to implement:**
- useQuery to fetch GET /api/products (with token from useAppStore)
- Table: SKU | Name | Unit | On Hand | Reserved | Free to Use | Reorder Point
- Row highlight: amber/orange bg when freeToUseQty < reorderPoint
- Create modal (POST /api/products) — show only if role is ADMIN or BUSINESS_OWNER
- Edit modal (PATCH /api/products/:id)
- Use apiFetch from `frontend/src/lib/api.ts` with `token: useAppStore().accessToken`
- Tailwind design tokens: accent=#714B67 (plum), bg=white, surface=#F8F7F5, border=#E5E7EB
