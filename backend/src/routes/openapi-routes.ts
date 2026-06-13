export interface OpenApiRouteDefinition {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  tag: string;
  summary: string;
  requestDto?: string;
  responseDto?: string;
  permissions?: string[];
}

export const openApiRoutes: OpenApiRouteDefinition[] = [
  { method: "POST", path: "/api/auth/login", tag: "Auth", summary: "Authenticate user", requestDto: "LoginRequestDto", responseDto: "LoginResponseDto" },
  { method: "GET", path: "/api/products", tag: "Products", summary: "List products", responseDto: "ProductListResponseDto" },
  { method: "POST", path: "/api/products", tag: "Products", summary: "Create product contract", requestDto: "CreateProductDto" },
  { method: "GET", path: "/api/sales-orders", tag: "Sales", summary: "List sales orders", responseDto: "SalesOrderListResponseDto" },
  { method: "POST", path: "/api/sales-orders", tag: "Sales", summary: "Create sales order contract", requestDto: "CreateSalesOrderDto" },
  { method: "PATCH", path: "/api/sales-orders/:id", tag: "Sales", summary: "Update sales order contract", requestDto: "UpdateSalesOrderDto" },
  { method: "POST", path: "/api/sales-orders/:id/confirm", tag: "Sales", summary: "Confirm sales order contract", requestDto: "ConfirmSalesOrderDto" },
  { method: "POST", path: "/api/sales-orders/:id/deliver", tag: "Sales", summary: "Deliver sales order contract", requestDto: "DeliverSalesOrderDto" },
  { method: "POST", path: "/api/sales-orders/:id/cancel", tag: "Sales", summary: "Cancel sales order contract", requestDto: "CancelSalesOrderDto" },
  { method: "GET", path: "/api/purchase-orders", tag: "Purchases", summary: "List purchase orders", responseDto: "PurchaseOrderListResponseDto" },
  { method: "POST", path: "/api/purchase-orders", tag: "Purchases", summary: "Create purchase order contract", requestDto: "CreatePurchaseOrderDto" },
  { method: "POST", path: "/api/purchase-orders/:id/confirm", tag: "Purchases", summary: "Confirm purchase order contract", requestDto: "ConfirmPurchaseOrderDto" },
  { method: "POST", path: "/api/purchase-orders/:id/receive", tag: "Purchases", summary: "Receive purchase order contract", requestDto: "ReceivePurchaseOrderDto" },
  { method: "POST", path: "/api/purchase-orders/:id/cancel", tag: "Purchases", summary: "Cancel purchase order contract", requestDto: "CancelPurchaseOrderDto" },
  { method: "GET", path: "/api/inventory", tag: "Inventory", summary: "Inventory overview", responseDto: "InventoryLedgerResponseDto" },
  { method: "POST", path: "/api/inventory/reservations", tag: "Inventory", summary: "Reserve stock contract", requestDto: "StockReservationDto" },
  { method: "POST", path: "/api/inventory/releases", tag: "Inventory", summary: "Release stock contract", requestDto: "StockReleaseDto" },
  { method: "POST", path: "/api/inventory/adjustments", tag: "Inventory", summary: "Adjust stock contract", requestDto: "StockAdjustmentDto" },
  { method: "POST", path: "/api/manufacturing-orders", tag: "Manufacturing", summary: "Create manufacturing order contract", requestDto: "CreateManufacturingOrderDto" },
  { method: "POST", path: "/api/manufacturing-orders/:id/start", tag: "Manufacturing", summary: "Start manufacturing contract", requestDto: "StartManufacturingDto" },
  { method: "POST", path: "/api/manufacturing-orders/:id/complete", tag: "Manufacturing", summary: "Complete manufacturing contract", requestDto: "CompleteManufacturingDto" },
  { method: "GET", path: "/api/bill-of-materials", tag: "Bill of Materials", summary: "List BOM contracts", responseDto: "BillOfMaterialResponseDto[]" },
  { method: "POST", path: "/api/bill-of-materials", tag: "Bill of Materials", summary: "Create BOM contract", requestDto: "CreateBillOfMaterialDto" },
  { method: "GET", path: "/api/procurement/rules", tag: "Procurement", summary: "List procurement rules" },
  { method: "POST", path: "/api/procurement/plan", tag: "Procurement", summary: "Plan procurement demand", requestDto: "ProcurementDemandDto", responseDto: "ProcurementPlanResponseDto" },
  { method: "GET", path: "/api/audit-logs", tag: "Audit", summary: "List audit logs", responseDto: "AuditLogListResponseDto" },
  { method: "GET", path: "/api/dashboard/summary", tag: "Dashboard", summary: "Dashboard summary metrics", responseDto: "DashboardSummaryDto" },
];
