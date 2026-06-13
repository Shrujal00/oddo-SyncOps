# Phase 06 — Procurement Automation

**Status:** TODO  
**Owner:** Teesha-Gokulgandhi  
**Depends on:** Phase 04 (Sales confirm) + Phase 05 (MO create)  

## Goal
Sales order confirm automatically creates a Purchase Order or Manufacturing Order when stock is insufficient, based on product procurement config.

## How It Works

```
SalesService.confirm(orderId)
  └─ for each line item:
       freeToUseQty = getStockSummary(productId).freeToUseQty
       if freeToUseQty >= orderedQty → reserve, continue
       if freeToUseQty < orderedQty AND procureOnDemand = true:
         shortfall = orderedQty - freeToUseQty
         ProcurementService.triggerProcurement({ salesOrderId, productId, shortfallQty, ... })
```

## Backend Tasks

### PROC-01 · Procurement engine (internal service)
`backend/src/modules/procurement/service.ts`

```ts
async triggerProcurement(demand: ProcurementDemand): Promise<void>
```

1. Load product with procurement config
2. If `procureOnDemand = false` → skip silently
3. Compute shortfall
4. If `supplyStrategy = BUY`:
   - Require `preferredVendorId` (throw 422 if missing with clear message)
   - Call `PurchasesService.create(...)` internally with:
     - vendorId = preferredVendorId
     - item: productId, qty = shortfall, unitCost = product.standardCost
     - notes: `"Auto-procurement for Sales Order {salesOrderId}"`
   - Status stays DRAFT (needs manual confirm or auto-confirm — business decision)
5. If `supplyStrategy = MAKE`:
   - Require `activeBomId` (throw 422 if missing)
   - Call `ManufacturingService.create(...)` internally with:
     - productId, qty = shortfall
     - notes: `"Auto-procurement for Sales Order {salesOrderId}"`
   - Status stays DRAFT
6. Write AuditLog linking procurement action to sales order

### PROC-02 · Procurement view endpoint
`GET /api/procurement`  
Returns list of auto-created POs and MOs (filter by `notes LIKE 'Auto-procurement%'` or add a source flag).  
Read-only. Admin + Inventory Manager.

## Configuration Requirements (on Product)

Before procurement can trigger, product must have:

| supplyStrategy | Required field |
|---|---|
| BUY | `preferredVendorId` set |
| MAKE | `activeBomId` set |

If not configured and `procureOnDemand = true`, throw a descriptive error on confirm.

## Frontend Tasks

### FE-PROC-01 · Procurement page
`frontend/src/app/(erp)/procurement/page.tsx`
- List of auto-triggered procurement actions
- Shows: source sales order, product, shortfall qty, action taken (PO or MO created), status

## Done Criteria
- [ ] Product with `procureOnDemand=true`, `supplyStrategy=BUY`, `preferredVendorId` set
- [ ] Create SO with qty > freeToUseQty → confirm → PO auto-created in DRAFT
- [ ] Product with `supplyStrategy=MAKE`, `activeBomId` set → confirm shortfall → MO auto-created
- [ ] Product with `procureOnDemand=false` → confirm → no auto-procurement
- [ ] Missing vendor/BoM config returns 422 with clear message
- [ ] Procurement page shows triggered actions
