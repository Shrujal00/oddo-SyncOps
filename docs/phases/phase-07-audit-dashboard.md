# Phase 07 — Audit Logs & Dashboard

**Status:** DONE
**Owner:** Teesha-Gokulgandhi (backend) · Shrujal00 (frontend)  
**Depends on:** Phase 04 + Phase 05 (events must exist to display)  

## Goal
All status transitions write audit events. Dashboard shows real-time KPI stats. Both pages fully functional.

## Backend Tasks

### AUDIT-01 · logEvent helper
`backend/src/modules/audit/repository.ts`

```ts
async logEvent(data: {
  userId?: string;
  eventType: AuditEventType;
  entityType: string;       // "SalesOrder" | "PurchaseOrder" | "ManufacturingOrder" | etc.
  entityId?: string;
  summary: string;          // Human-readable one-liner
  metadata?: Record<string, unknown>;
  occurredAt?: Date;        // defaults to now()
}): Promise<void>
```

This must be called (not stubbed) in:
- `SalesService`: confirm, deliver, cancel
- `PurchasesService`: confirm, receive, cancel
- `ManufacturingService`: confirm, start, complete
- `ProcurementService`: triggerProcurement
- `AuthService`: login (USER_LOGIN)
- `ProductsService`: create, update (PRODUCT_UPDATED)
- `InventoryService`: adjustment (INVENTORY_CHANGED)

### AUDIT-02 · Audit list endpoint
`GET /api/audit`  
Query params: `entityType`, `entityId`, `eventType`, `userId`, `from`, `to`, `page`, `limit`  
Default sort: `occurredAt DESC`  

Role filtering:
- ADMIN: all events
- Others: own events (`userId = req.user.sub`) + events for their module

### DASH-01 · Dashboard stats endpoint
`GET /api/dashboard`

```ts
{
  salesOrders: { total, byStatus, pendingDeliveries },
  purchaseOrders: { total, byStatus, partialReceipts },
  manufacturingOrders: { total, byStatus, inProgress },
  lowStockProducts: Array<{ id, sku, name, freeToUseQty, reorderPoint }>
}
```

- All queries run in `Promise.all` (parallel — not sequential)
- `lowStockProducts`: products where `freeToUseQty < reorderPoint`

## Frontend Tasks

### FE-DASH-01 · Dashboard page (wire up)
`frontend/src/app/(dashboard)/overview/page.tsx`
- 4 stat cards: Total Sales Orders, Pending Deliveries, MOs In Progress, Low Stock Count
- Low stock product list table below cards
- Auto-refresh every 30s or on-focus

### FE-AUDIT-01 · Audit page
`frontend/src/app/(erp)/audit/page.tsx`
- Table: Timestamp | User | Event Type | Entity | Summary
- Filter bar: event type, entity type, date range
- Paginated

## Done Criteria
- [x] Confirm a sales order → AuditLog row created
- [x] Complete a manufacturing order → AuditLog row created
- [x] `GET /api/audit` returns events filtered by role
- [x] `GET /api/dashboard` returns correct counts
- [x] Dashboard page shows live counts
- [x] Audit page shows filterable event log
