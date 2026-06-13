# 01 — Products

## Tasks

### PROD-01 · Product CRUD
**Status:** TODO  
**Files:** `backend/src/modules/products/service.ts`, `repository.ts`, `validation.ts`  
**What to implement:**
- `list(filters)`: query with optional `sku`, `name`, `lowStockOnly` filters. Attach computed stock fields to each result.
- `create(dto)`: insert Product row, return with stock fields (all zero for new product).
- `update(id, dto)`: patch allowed fields. Return with stock fields.
- `getById(id)`: single product with stock.

### PROD-02 · Stock qty compute helper
**Status:** TODO  
**Files:** `backend/src/modules/inventory/repository.ts` (add method), or shared util  
**What to implement:**
```ts
// Returns { onHandQty, reservedQty, freeToUseQty } for a productId
async getStockSummary(productId: string): Promise<StockSummary>
```
- `onHandQty` = SUM of movements where type IN (PURCHASE, PRODUCTION, ADJUSTMENT with positive qty) MINUS SUM of (SALE, CONSUMPTION, ADJUSTMENT negative)
  - Simpler: SUM(quantity) from InventoryMovement where productId — quantities are signed (positive = in, negative = out).
- `reservedQty` = SUM of (quantity - deliveredQty) from SalesOrderItems where status IN (CONFIRMED, PARTIALLY_DELIVERED) + SUM of component quantities from active MO BOM items.
- `freeToUseQty` = onHandQty - reservedQty

**Schema note:** InventoryMovement.quantity is stored as positive Int. Movement direction comes from movementType:
- PURCHASE, PRODUCTION, ADJUSTMENT(positive) → add
- SALE, CONSUMPTION → subtract
- Recommend storing quantity always positive and using movementType for direction.

### PROD-03 · Procurement config on product
**Status:** DONE (schema updated, DTOs updated)  
**Fields added:** `procureOnDemand`, `procurementMode` (MTS/MTO), `supplyStrategy` (BUY/MAKE), `preferredVendorId`, `activeBomId`  
**Notes:** `activeBomId` is a soft reference (no FK constraint) to BillOfMaterial.id — must validate existence in service layer.
