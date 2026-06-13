# 02 — Inventory

## Tasks

### INV-01 · InventoryMovement write helper
**Status:** TODO  
**Files:** `backend/src/modules/inventory/repository.ts`  
**What to implement:**
```ts
async recordMovement(data: {
  productId: string;
  movementType: InventoryMovementType;
  quantity: number; // always positive; direction implied by type
  referenceType?: string; // e.g. "SalesOrder", "PurchaseOrder", "ManufacturingOrder"
  referenceId?: string;
  notes?: string;
  occurredAt?: Date;
}): Promise<InventoryMovement>
```
This is called by Sales (deliver), Purchase (receive), Manufacturing (complete). Never called directly by user HTTP requests — it's an internal helper.

### INV-02 · Inventory movement list (HTTP)
**Status:** TODO  
**Files:** `backend/src/modules/inventory/service.ts`, `controller.ts`, `routes.ts`  
**What to implement:**
- `GET /api/inventory/movements?productId=&type=&from=&to=` — paginated list of movements
- Inventory Manager + Admin access only

### INV-03 · Manual stock adjustment
**Status:** TODO  
**Files:** `backend/src/modules/inventory/service.ts`  
**What to implement:**
- `POST /api/inventory/adjustments` — Inventory Manager only
- Creates ADJUSTMENT movement, writes AuditLog
- Body: `{ productId, quantity (signed), notes }`
