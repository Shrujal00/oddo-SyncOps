import { InventoryMovementType } from "@prisma/client";
import { prisma } from "../../database/prisma.js";

export interface StockSummary {
  onHandQty: number;
  reservedQty: number;
  freeToUseQty: number;
}

export interface RecordMovementInput {
  productId: string;
  movementType: InventoryMovementType;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  occurredAt?: Date;
}

export interface ListMovementsFilters {
  productId?: string;
  type?: InventoryMovementType;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
}

const POSITIVE_TYPES: InventoryMovementType[] = ["PURCHASE", "PRODUCTION"];
const NEGATIVE_TYPES: InventoryMovementType[] = ["SALE", "CONSUMPTION"];

export class InventoryRepository {
  async getStockSummary(productId: string): Promise<StockSummary> {
    const movements = await prisma.inventoryMovement.groupBy({
      by: ["movementType"],
      where: { productId, deletedAt: null },
      _sum: { quantity: true },
    });

    let onHandQty = 0;
    for (const m of movements) {
      const sum = m._sum.quantity ?? 0;
      if (POSITIVE_TYPES.includes(m.movementType)) {
        onHandQty += sum;
      } else if (NEGATIVE_TYPES.includes(m.movementType)) {
        onHandQty -= sum;
      } else {
        // ADJUSTMENT stored as signed integer
        onHandQty += sum;
      }
    }

    const reserved = await prisma.salesOrderItem.aggregate({
      where: {
        productId,
        deletedAt: null,
        salesOrder: {
          status: { in: ["CONFIRMED", "PARTIALLY_DELIVERED"] },
          deletedAt: null,
        },
      },
      _sum: { quantity: true, deliveredQty: true },
    });

    const totalOrdered = reserved._sum.quantity ?? 0;
    const totalDelivered = reserved._sum.deliveredQty ?? 0;
    const reservedQty = Math.max(0, totalOrdered - totalDelivered);

    return { onHandQty, reservedQty, freeToUseQty: onHandQty - reservedQty };
  }

  async recordMovement(data: RecordMovementInput) {
    return prisma.inventoryMovement.create({
      data: {
        productId: data.productId,
        movementType: data.movementType,
        quantity: data.quantity,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        notes: data.notes,
        occurredAt: data.occurredAt ?? new Date(),
      },
    });
  }

  async listMovements(filters: ListMovementsFilters) {
    const { productId, type, from, to, page = 1, pageSize = 20 } = filters;

    const where = {
      deletedAt: null as null,
      ...(productId && { productId }),
      ...(type && { movementType: type }),
      ...((from || to) && {
        occurredAt: {
          ...(from && { gte: from }),
          ...(to && { lte: to }),
        },
      }),
    };

    const [entries, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        include: { product: { select: { id: true, sku: true, name: true } } },
        orderBy: { occurredAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.inventoryMovement.count({ where }),
    ]);

    return { entries, total, page, pageSize };
  }
}
