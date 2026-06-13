import { prisma } from "../../database/prisma.js";

export class ProcurementRepository {
  listRules() {
    return prisma.product.findMany({
      where: { deletedAt: null, procureOnDemand: true },
      select: {
        id: true,
        sku: true,
        name: true,
        procurementMode: true,
        supplyStrategy: true,
        preferredVendorId: true,
        activeBomId: true,
      },
      orderBy: { name: "asc" },
    });
  }

  getProduct(productId: string) {
    return prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: {
        id: true,
        sku: true,
        name: true,
        procureOnDemand: true,
        supplyStrategy: true,
        preferredVendorId: true,
        activeBomId: true,
        standardCost: true,
      },
    });
  }

  listAutoActions() {
    return prisma.auditLog.findMany({
      where: {
        deletedAt: null,
        entityType: "Procurement",
        summary: { startsWith: "Auto-procurement" },
      },
      orderBy: { occurredAt: "desc" },
      take: 100,
    });
  }
}
