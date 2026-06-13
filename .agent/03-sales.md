# 03 — Sales

## Depends on
- `00-infrastructure` (DONE)
- `01-products` PROD-02 (stock compute)
- `02-inventory` INV-01 (movement write)
- `06-procurement` (trigger only — can stub with TODO comment for now)

## Tasks

### SALES-01 · Create + Update sales order (DRAFT)
**Status:** TODO  
**Files:** `backend/src/modules/sales/service.ts`, `repository.ts`, `validation.ts`  
**What to implement:**
- `create(dto)`: generate orderNumber (e.g. `SO-YYYYMMDD-XXXX`), create SalesOrder in DRAFT with items
- `update(id, dto)`: only allowed in DRAFT status
- No stock impact at this stage

### SALES-02 · Confirm sales order
**Status:** TODO  
**Files:** `backend/src/modules/sales/service.ts`  
**What to implement:**
1. Transition DRAFT → CONFIRMED
2. For each item: compute freeToUseQty (via PROD-02)
3. Reserve available qty (update reservedQty tracking via InventoryMovement or direct reservation — see note)
4. If `product.procureOnDemand = true` AND shortfall > 0: call procurement trigger (see `06-procurement`)
5. Write AuditLog: SALES_ORDER_CHANGED

**Reservation note:** Reservations are tracked implicitly — "reserved" = sum of undelivered confirmed sales order items. No separate reservation table needed.

### SALES-03 · Deliver sales order
**Status:** TODO  
**Files:** `backend/src/modules/sales/service.ts`  
**What to implement:**
1. Accept partial delivery: `{ items: [{ salesOrderItemId, deliveredQty }] }`
2. Validate deliveredQty ≤ (quantity - already deliveredQty) per item
3. Write SALE InventoryMovement for each item (negative stock impact)
4. Update `deliveredQty` on SalesOrderItem
5. Compute overall order status: if all items fully delivered → DELIVERED, else PARTIALLY_DELIVERED
6. Write AuditLog: SALES_ORDER_CHANGED

### SALES-04 · Cancel sales order
**Status:** TODO  
**Files:** `backend/src/modules/sales/service.ts`  
**What to implement:**
- Only DRAFT or CONFIRMED → CANCELLED
- Write AuditLog
