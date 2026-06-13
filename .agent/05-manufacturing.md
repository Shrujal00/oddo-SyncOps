# 05 — Manufacturing

## Depends on
- `00-infrastructure` (DONE)
- `01-products` PROD-02 (stock compute, for component availability check)
- `02-inventory` INV-01 (movement write)

## Tasks

### MFG-01 · WorkCenter CRUD
**Status:** TODO  
**Files:** create `backend/src/modules/manufacturing/` (add workcenter routes) or separate module  
**What to implement:**
- `GET /api/manufacturing/work-centers` — list
- `POST /api/manufacturing/work-centers` — create (Admin only)
- `PATCH /api/manufacturing/work-centers/:id` — update
- WorkCenter model added to schema (DONE)

### MFG-02 · Bill of Materials CRUD
**Status:** TODO  
**Files:** `backend/src/modules/bill-of-materials/service.ts`, `repository.ts`, `validation.ts`  
**What to implement:**
- Create BoM with items (componentProductId + quantity + optional scrapPercentage)
- One active BoM per product (enforce `isActive` uniqueness per productId in service layer)
- `GET /api/bom?productId=` — list BoMs
- `GET /api/bom/:id` — get with items
- `POST /api/bom` — create
- `PATCH /api/bom/:id` — update (name, version, items)
- `DELETE /api/bom/:id` — soft delete

### MFG-03 · Create Manufacturing Order
**Status:** TODO  
**Files:** `backend/src/modules/manufacturing/service.ts`, `repository.ts`  
**What to implement:**
1. Lookup active BoM for product (via `activeBomId` on Product or latest active BoM)
2. Create ManufacturingOrder in DRAFT
3. Create WorkOrders from BoM operations (operationName, sequence, plannedDurationMins, workCenterId)
4. orderNumber: `MO-YYYYMMDD-XXXX`

### MFG-04 · Confirm Manufacturing Order
**Status:** TODO  
**What to implement:**
1. DRAFT → CONFIRMED
2. For each BoM component: check freeToUseQty — warn if insufficient (don't block, just flag)
3. Reserve components (tracked implicitly via active MO count — see PROD-02 note)
4. Write AuditLog

### MFG-05 · Start + Complete Manufacturing Order
**Status:** TODO  
**What to implement:**
- `start`: CONFIRMED → IN_PROGRESS, update work order statuses to RELEASED
- `complete`:
  1. IN_PROGRESS → COMPLETED
  2. For each BoM component: write CONSUMPTION InventoryMovement (negative, qty × MO quantity, with scrap)
  3. Write PRODUCTION InventoryMovement for finished product (positive, MO quantity)
  4. Mark all work orders COMPLETED
  5. Write AuditLog: MANUFACTURING_COMPLETED + INVENTORY_CHANGED

### MFG-06 · Work Order status updates
**Status:** TODO  
**What to implement:**
- `PATCH /api/manufacturing/:moId/work-orders/:woId` — update status (PLANNED → RELEASED → IN_PROGRESS → COMPLETED)
- Manufacturing User only
