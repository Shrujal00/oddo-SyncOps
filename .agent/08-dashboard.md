# 08 — Dashboard

## Depends on
- All modules implemented (reads their data)

## Tasks

### DASH-01 · Dashboard stats endpoint
**Status:** TODO  
**Files:** `backend/src/modules/dashboard/service.ts`, `repository.ts`  
**What to implement:**
`GET /api/dashboard` — returns:
```ts
{
  salesOrders: {
    total: number;
    byStatus: Record<SalesOrderStatus, number>;
    pendingDeliveries: number; // CONFIRMED + PARTIALLY_DELIVERED
  };
  purchaseOrders: {
    total: number;
    byStatus: Record<PurchaseOrderStatus, number>;
    partialReceipts: number;
  };
  manufacturingOrders: {
    total: number;
    byStatus: Record<ManufacturingStatus, number>;
    inProgress: number;
  };
  lowStockProducts: Array<{ id, sku, name, freeToUseQty, reorderPoint }>;
  // products where freeToUseQty < reorderPoint
}
```
- Use `Promise.all` for parallel queries — don't run sequentially
- Access: all roles (each sees different widget data per RBAC — but single endpoint, filter in frontend)
