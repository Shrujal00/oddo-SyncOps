const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const demoProducts = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    sku: "FG-BIKE-001",
    name: "Electric City Bike",
    description: "Finished good assembled in-house",
    unitOfMeasure: "pcs",
    standardCost: 18000,
    sellingPrice: 32000,
    reorderPoint: 5,
    procureOnDemand: true,
    procurementMode: "MTO",
    supplyStrategy: "MAKE",
    activeBomId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    onHandQty: 3,
    reservedQty: 2,
    freeToUseQty: 1,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    sku: "COMP-MOTOR",
    name: "Hub Motor",
    description: "Purchased component",
    unitOfMeasure: "pcs",
    standardCost: 6500,
    sellingPrice: 0,
    reorderPoint: 10,
    procureOnDemand: true,
    procurementMode: "MTS",
    supplyStrategy: "BUY",
    preferredVendorId: "55555555-5555-5555-5555-555555555555",
    onHandQty: 4,
    reservedQty: 0,
    freeToUseQty: 4,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    sku: "COMP-BATTERY",
    name: "Battery Pack",
    description: "Purchased component",
    unitOfMeasure: "pcs",
    standardCost: 9000,
    sellingPrice: 0,
    reorderPoint: 8,
    procureOnDemand: true,
    procurementMode: "MTS",
    supplyStrategy: "BUY",
    preferredVendorId: "55555555-5555-5555-5555-555555555555",
    onHandQty: 2,
    reservedQty: 0,
    freeToUseQty: 2,
  },
];

const demoCustomers = [
  { id: "44444444-4444-4444-4444-444444444444", name: "Oddo Retail", email: "buyer@oddo.example", phone: "+91 90000 00000" },
];

const demoVendors = [
  { id: "55555555-5555-5555-5555-555555555555", name: "Volt Components", email: "ops@volt.example", phone: "+91 91111 11111" },
];

const demoSalesOrders = [
  {
    id: "66666666-6666-6666-6666-666666666666",
    orderNumber: "SO-20260613-0001",
    customerId: demoCustomers[0].id,
    customer: demoCustomers[0],
    status: "PARTIALLY_DELIVERED",
    orderDate: new Date().toISOString(),
    items: [
      { id: "77777777-7777-7777-7777-777777777777", productId: demoProducts[0].id, product: demoProducts[0], quantity: 3, deliveredQty: 1, unitPrice: 32000 },
    ],
    totalValue: 96000,
  },
];

const demoPurchaseOrders = [
  {
    id: "88888888-8888-8888-8888-888888888888",
    orderNumber: "PO-20260613-0001",
    vendorId: demoVendors[0].id,
    vendor: demoVendors[0],
    status: "CONFIRMED",
    orderDate: new Date().toISOString(),
    items: [
      { id: "99999999-9999-9999-9999-999999999999", productId: demoProducts[1].id, product: demoProducts[1], quantity: 6, receivedQty: 0, unitCost: 6500 },
    ],
    totalValue: 39000,
  },
];

const demoWorkCenters = [
  { id: "12121212-1212-1212-1212-121212121212", name: "Assembly Cell A", description: "Final assembly bench" },
  { id: "13131313-1313-1313-1313-131313131313", name: "QC Station", description: "Electrical and safety test" },
];

const demoManufacturingOrders = [
  {
    id: "abababab-abab-abab-abab-abababababab",
    orderNumber: "MO-20260613-0001",
    productId: demoProducts[0].id,
    product: demoProducts[0],
    quantity: 2,
    status: "IN_PROGRESS",
    workOrders: [
      { id: "cdcdcdcd-cdcd-cdcd-cdcd-cdcdcdcdcdcd", operationName: "Assemble frame, motor, battery", sequence: 1, plannedDurationMins: 90, workCenter: demoWorkCenters[0], status: "IN_PROGRESS" },
      { id: "efefefef-efef-efef-efef-efefefefefef", operationName: "Quality inspection", sequence: 2, plannedDurationMins: 30, workCenter: demoWorkCenters[1], status: "RELEASED" },
    ],
  },
];

const demoBoms = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    productId: demoProducts[0].id,
    name: "Electric Bike Standard BoM",
    version: "1",
    isActive: true,
    items: [
      { id: "b1", componentProductId: demoProducts[1].id, componentProduct: demoProducts[1], quantity: 1, scrapPercentage: 2 },
      { id: "b2", componentProductId: demoProducts[2].id, componentProduct: demoProducts[2], quantity: 1, scrapPercentage: 1 },
    ],
  },
];

function demoPayload(path: string, method = "GET") {
  const clean = path.split("?")[0];
  if (method !== "GET") return { data: { id: "demo-ok", ok: true } };
  if (clean === "/dashboard" || clean === "/dashboard/summary") {
    return {
      data: {
        salesOrders: { total: 1, byStatus: { PARTIALLY_DELIVERED: 1 }, pendingDeliveries: 1 },
        purchaseOrders: { total: 1, byStatus: { CONFIRMED: 1 }, partialReceipts: 0 },
        manufacturingOrders: { total: 1, byStatus: { IN_PROGRESS: 1 }, inProgress: 1 },
        lowStockProducts: demoProducts.filter((p) => p.freeToUseQty < p.reorderPoint),
      },
    };
  }
  if (clean === "/products") return { data: { products: demoProducts, total: demoProducts.length } };
  if (clean === "/customers") return { data: { customers: demoCustomers, total: demoCustomers.length } };
  if (clean === "/vendors") return { data: { vendors: demoVendors, total: demoVendors.length } };
  if (clean === "/sales") return { data: { salesOrders: demoSalesOrders } };
  if (clean === "/purchases") return { data: { purchaseOrders: demoPurchaseOrders } };
  if (clean === "/manufacturing") return { data: demoManufacturingOrders };
  if (clean === "/manufacturing/work-centers") return { data: demoWorkCenters };
  if (clean === "/bom") return { data: demoBoms };
  if (clean === "/procurement") {
    return {
      data: {
        actions: [
          {
            id: "proc-demo-1",
            salesOrderId: demoSalesOrders[0].id,
            productId: demoProducts[1].id,
            actionType: "CREATE_PURCHASE_ORDER",
            createdEntityType: "PurchaseOrder",
            createdEntityId: demoPurchaseOrders[0].id,
            summary: "Auto-procurement created PurchaseOrder for 6 unit(s)",
            occurredAt: new Date().toISOString(),
          },
          {
            id: "proc-demo-2",
            salesOrderId: demoSalesOrders[0].id,
            productId: demoProducts[0].id,
            actionType: "CREATE_MANUFACTURING_ORDER",
            createdEntityType: "ManufacturingOrder",
            createdEntityId: demoManufacturingOrders[0].id,
            summary: "Auto-procurement created ManufacturingOrder for 2 unit(s)",
            occurredAt: new Date().toISOString(),
          },
        ],
        total: 2,
      },
    };
  }
  if (clean === "/audit") {
    return {
      data: {
        auditLogs: [
          { id: "a1", eventType: "SALES_ORDER_CHANGED", entityType: "SalesOrder", entityId: demoSalesOrders[0].id, summary: "Confirmed", occurredAt: new Date().toISOString(), userId: "demo" },
          { id: "a2", eventType: "INVENTORY_CHANGED", entityType: "ManufacturingOrder", entityId: demoManufacturingOrders[0].id, summary: "Recorded component consumption and finished production", occurredAt: new Date().toISOString(), userId: "demo" },
          { id: "a3", eventType: "PURCHASE_ORDER_CHANGED", entityType: "PurchaseOrder", entityId: demoPurchaseOrders[0].id, summary: "Confirmed", occurredAt: new Date().toISOString(), userId: "demo" },
        ],
        total: 3,
        page: 1,
        limit: 25,
      },
    };
  }
  if (clean === "/inventory/movements") {
    return {
      data: {
        entries: [
          { id: "m1", productId: demoProducts[0].id, product: demoProducts[0], movementType: "PRODUCTION", quantity: 2, referenceType: "ManufacturingOrder", referenceId: demoManufacturingOrders[0].id, notes: "Production for MO-20260613-0001", occurredAt: new Date().toISOString() },
          { id: "m2", productId: demoProducts[1].id, product: demoProducts[1], movementType: "CONSUMPTION", quantity: 2, referenceType: "ManufacturingOrder", referenceId: demoManufacturingOrders[0].id, notes: "Consumption for MO-20260613-0001", occurredAt: new Date().toISOString() },
          { id: "m3", productId: demoProducts[0].id, product: demoProducts[0], movementType: "SALE", quantity: 1, referenceType: "SalesOrder", referenceId: demoSalesOrders[0].id, notes: "Delivery for SO-20260613-0001", occurredAt: new Date().toISOString() },
        ],
        total: 3,
        page: 1,
        pageSize: 25,
      },
    };
  }
  return { data: null };
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers: extraHeaders, ...rest } = options;
  const method = rest.method ?? "GET";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders as Record<string, string>),
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...rest, headers });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  } catch (error) {
    if (!token && process.env.NEXT_PUBLIC_DEMO_FALLBACK === "true") {
      return demoPayload(path, method) as T;
    }
    throw error;
  }
}
