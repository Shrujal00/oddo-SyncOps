import { prisma } from "../../database/prisma.js";

export class DashboardRepository {
  async loadSummaryInputs() {
    const [
      salesTotal,
      salesByStatus,
      pendingDeliveries,
      purchaseTotal,
      purchaseByStatus,
      partialReceipts,
      manufacturingTotal,
      manufacturingByStatus,
      inProgress,
      products,
    ] = await Promise.all([
      prisma.salesOrder.count({ where: { deletedAt: null } }),
      prisma.salesOrder.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.salesOrder.count({
        where: { deletedAt: null, status: { in: ["CONFIRMED", "PARTIALLY_DELIVERED"] } },
      }),
      prisma.purchaseOrder.count({ where: { deletedAt: null } }),
      prisma.purchaseOrder.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.purchaseOrder.count({
        where: { deletedAt: null, status: "PARTIALLY_RECEIVED" },
      }),
      prisma.manufacturingOrder.count({ where: { deletedAt: null } }),
      prisma.manufacturingOrder.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.manufacturingOrder.count({ where: { deletedAt: null, status: "IN_PROGRESS" } }),
      prisma.product.findMany({
        where: { deletedAt: null, reorderPoint: { gt: 0 } },
        select: { id: true, sku: true, name: true, reorderPoint: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      salesTotal,
      salesByStatus,
      pendingDeliveries,
      purchaseTotal,
      purchaseByStatus,
      partialReceipts,
      manufacturingTotal,
      manufacturingByStatus,
      inProgress,
      products,
    };
  }
}
