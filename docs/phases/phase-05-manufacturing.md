# Phase 05 — Manufacturing & Bill of Materials

**Status:** TODO  
**Owner:** Teesha-Gokulgandhi (backend) · Shrujal00 (frontend)  
**Depends on:** Phase 03  

## Goal
Full BoM management, WorkCenter setup, and Manufacturing Order lifecycle with inventory impact.

## Backend Tasks

### BOM-01 · Bill of Materials CRUD
`GET /api/bom?productId=` — list  
`GET /api/bom/:id` — with items  
`POST /api/bom` — create with component items + operations  
`PATCH /api/bom/:id` — update name, version, items  
`DELETE /api/bom/:id` — soft delete  

Rules:
- One active BoM per product at a time (enforce `isActive` in service)
- Component productIds must exist

BoM item fields: `componentProductId`, `quantity`, `scrapPercentage?`  
Operation fields (on WorkOrder template in BoM): `operationName`, `sequence`, `plannedDurationMins`, `workCenterId?`

### WC-01 · WorkCenter CRUD
`GET /api/manufacturing/work-centers`  
`POST /api/manufacturing/work-centers` — Admin only  
`PATCH /api/manufacturing/work-centers/:id`  

### MFG-01 · Create Manufacturing Order
`POST /api/manufacturing`
1. Lookup active BoM for product (via `activeBomId` on Product, or latest `isActive` BoM)
2. Create ManufacturingOrder in DRAFT
3. Create WorkOrders from BoM operations (operationName, sequence, plannedDurationMins, workCenterId)
4. orderNumber: `MO-YYYYMMDD-XXXX`

### MFG-02 · Confirm Manufacturing Order
`POST /api/manufacturing/:id/confirm`
- DRAFT → CONFIRMED
- Check component availability (warn in response if insufficient, don't block)
- Write AuditLog

### MFG-03 · Start Manufacturing Order
`POST /api/manufacturing/:id/start`
- CONFIRMED → IN_PROGRESS
- Set WorkOrder statuses to RELEASED
- Write AuditLog

### MFG-04 · Complete Manufacturing Order
`POST /api/manufacturing/:id/complete`
1. IN_PROGRESS → COMPLETED
2. Per BoM component: write CONSUMPTION movement
   - qty = component.quantity × MO.quantity × (1 + scrapPercentage/100)
3. Write PRODUCTION movement for finished product (MO.quantity)
4. Mark all WorkOrders COMPLETED
5. Write AuditLog: MANUFACTURING_COMPLETED + INVENTORY_CHANGED

### MFG-05 · Work Order status updates
`PATCH /api/manufacturing/:moId/work-orders/:woId`  
`{ status: PLANNED | RELEASED | IN_PROGRESS | COMPLETED }`  
Manufacturing User only.

## Frontend Tasks

### FE-BOM-01 · BoM page
- BoM list by product
- Create / edit BoM with component lines (product picker, qty, scrap %)
- Operation lines (name, sequence, duration, work center)

### FE-MFG-01 · Manufacturing page
- MO list with status badges
- Create MO (product picker, auto-loads BoM preview)
- Status action buttons: Confirm / Start / Complete
- Work order steps list per MO with individual status updates

## Done Criteria
- [ ] Create BoM with 3 components + 2 operations
- [ ] Create MO → WorkOrders auto-generated from BoM
- [ ] Complete MO → component CONSUMPTION movements written → component stock decreases
- [ ] Complete MO → PRODUCTION movement written → finished product stock increases
- [ ] Scrap percentage applied to consumption qty
- [ ] Frontend MO list shows work order steps
