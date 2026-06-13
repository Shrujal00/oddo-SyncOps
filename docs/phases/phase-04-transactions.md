# Phase 04 — Sales & Purchases

**Status:** TODO  
**Owner:** Teesha-Gokulgandhi (backend) · Shrujal00 (frontend)  
**Depends on:** Phase 03  

## Goal
Full order lifecycle for Sales and Purchases. Stock updates on deliver/receive.

## Backend Tasks

### SALES-01 · Create + update sales order
`POST /api/sales` — creates in DRAFT  
`PATCH /api/sales/:id` — DRAFT only  
- Auto-generate `orderNumber`: `SO-YYYYMMDD-XXXX`
- Customer must exist
- Items: productId + quantity + unitPrice

### SALES-02 · Confirm sales order
`POST /api/sales/:id/confirm`
1. DRAFT → CONFIRMED
2. Per item: compute `freeToUseQty`
3. If `freeToUseQty < orderedQty` AND `product.procureOnDemand = true` → call procurement trigger (stub for now, implement in Phase 06)
4. Write AuditLog: SALES_ORDER_CHANGED

### SALES-03 · Deliver sales order (partial + full)
`POST /api/sales/:id/deliver`  
Body: `{ items: [{ salesOrderItemId, deliveredQty }] }`
1. Validate `deliveredQty ≤ remaining`
2. Write SALE InventoryMovement per item (negative)
3. Update `deliveredQty` on item
4. Status: all delivered → DELIVERED, else PARTIALLY_DELIVERED
5. Write AuditLog + INVENTORY_CHANGED

### SALES-04 · Cancel sales order
`POST /api/sales/:id/cancel` — DRAFT or CONFIRMED only

### PO-01 · Create + update purchase order
`POST /api/purchases` — DRAFT  
`PATCH /api/purchases/:id` — DRAFT only  
- orderNumber: `PO-YYYYMMDD-XXXX`
- Vendor must exist

### PO-02 · Confirm purchase order
`POST /api/purchases/:id/confirm`
- DRAFT → CONFIRMED
- Write AuditLog

### PO-03 · Receive purchase order (partial + full)
`POST /api/purchases/:id/receive`  
Body: `{ items: [{ purchaseOrderItemId, receivedQty }] }`
1. Validate `receivedQty ≤ remaining`
2. Write PURCHASE InventoryMovement per item (positive)
3. Update `receivedQty` on item
4. Status: all received → RECEIVED, else PARTIALLY_RECEIVED
5. Write AuditLog + INVENTORY_CHANGED

### PO-04 · Cancel purchase order
`POST /api/purchases/:id/cancel` — DRAFT or CONFIRMED only

## Frontend Tasks

### FE-SALES-01 · Sales page
- Sales order list with status badges
- Create order flow: select customer → add line items → save as draft
- Confirm / Deliver (partial form) / Cancel action buttons
- Delivery modal: per-item qty inputs

### FE-PO-01 · Purchases page
- PO list with status badges
- Create PO: select vendor → add line items
- Confirm / Receive (partial form) / Cancel actions

## Done Criteria
- [ ] Create SO → confirm → stock is reserved (freeToUseQty decreases)
- [ ] Deliver SO → SALE movement written → onHandQty decreases
- [ ] Create PO → confirm → receive → PURCHASE movement → onHandQty increases
- [ ] Partial delivery sets status PARTIALLY_DELIVERED
- [ ] Cancel only works in allowed states
- [ ] Frontend order lists show correct status badges
