# 06 — Procurement Automation

This is the intelligence layer — triggered by Sales confirm, NOT a user-facing CRUD endpoint.

## Depends on
- `03-sales` SALES-02 (trigger point)
- `04-purchases` PO-01 (auto-create PO)
- `05-manufacturing` MFG-03 (auto-create MO)

## Tasks

### PROC-01 · Procurement engine (internal service)
**Status:** DONE
**Files:** `backend/src/modules/procurement/service.ts`  
**What to implement:**

```ts
// Called from SalesService.confirm() for each line item with shortfall
async triggerProcurement(demand: ProcurementDemand): Promise<void>
```

Logic:
1. Load product with procurement config
2. If `procureOnDemand = false` → skip
3. Compute shortfall = `demand.requiredQty - demand.availableQty`
4. If shortfall ≤ 0 → skip
5. If `supplyStrategy = BUY`:
   - Lookup `preferredVendorId` (required — throw if missing)
   - Auto-create PurchaseOrder via PurchasesService (DRAFT status, agent created)
   - Set notes: `"Auto-created for Sales Order {salesOrderId}"`
6. If `supplyStrategy = MAKE`:
   - Lookup `activeBomId` (required — throw if missing)
   - Auto-create ManufacturingOrder via ManufacturingService (DRAFT status)
   - Set notes: `"Auto-created for Sales Order {salesOrderId}"`
7. Write AuditLog linking procurement action to sales order

### PROC-02 · Procurement list (HTTP)
**Status:** DONE
**Files:** `backend/src/modules/procurement/controller.ts`, `routes.ts`  
**What to implement:**
- `GET /api/procurement` — list auto-created procurement actions (read from PO/MO with source=auto)
- Admin + Inventory Manager access
- This is a read-only view — no direct creation via this endpoint
