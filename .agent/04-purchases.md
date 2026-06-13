# 04 — Purchases

## Depends on
- `00-infrastructure` (DONE)
- `02-inventory` INV-01 (movement write)

## Tasks

### PO-01 · Create + Update purchase order (DRAFT)
**Status:** DONE
**Files:** `backend/src/modules/purchases/service.ts`, `repository.ts`, `validation.ts`  
**What to implement:**
- `create(dto)`: generate orderNumber (`PO-YYYYMMDD-XXXX`), create PurchaseOrder in DRAFT with items
- `update(id, dto)`: only in DRAFT
- Vendor must exist

### PO-02 · Confirm purchase order
**Status:** DONE
**Files:** `backend/src/modules/purchases/service.ts`  
**What to implement:**
- DRAFT → CONFIRMED
- Write AuditLog: PURCHASE_ORDER_CHANGED

### PO-03 · Receive purchase order (partial + full)
**Status:** DONE
**Files:** `backend/src/modules/purchases/service.ts`  
**What to implement:**
1. Accept: `{ items: [{ purchaseOrderItemId, receivedQty }] }`
2. Validate receivedQty ≤ (quantity - already receivedQty)
3. Write PURCHASE InventoryMovement per item (positive stock impact)
4. Update `receivedQty` on PurchaseOrderItem
5. Compute order status: all received → RECEIVED, else PARTIALLY_RECEIVED
6. Write AuditLog: PURCHASE_ORDER_CHANGED + INVENTORY_CHANGED

### PO-04 · Cancel purchase order
**Status:** DONE
- DRAFT or CONFIRMED only → CANCELLED
- Write AuditLog
