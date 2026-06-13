import type { InventoryMovementType, Prisma, RoleName } from "@prisma/client";
import { prisma } from "../../database/prisma.js";
import type { AssistantChunkInput } from "./dto.js";

type ProductForStock = {
  id: string;
  sku: string;
  name: string;
  productType: string;
  reorderPoint: number;
  procureOnDemand: boolean;
  procurementMode: string;
  supplyStrategy: string;
  preferredVendor?: { name: string } | null;
};

const POSITIVE_TYPES: InventoryMovementType[] = ["PURCHASE", "PRODUCTION"];
const NEGATIVE_TYPES: InventoryMovementType[] = ["SALE", "CONSUMPTION"];

function decimalToNumber(value: unknown) {
  return Number(value ?? 0);
}

function toJsonEmbedding(embedding: number[]) {
  return embedding as unknown as Prisma.InputJsonValue;
}

function stockByProduct(products: ProductForStock[], movementRows: Array<{
  productId: string;
  movementType: InventoryMovementType;
  _sum: { quantity: number | null };
}>, reservationRows: Array<{
  productId: string;
  _sum: { quantity: number | null; deliveredQty: number | null };
}>) {
  const stocks = new Map<string, { onHandQty: number; reservedQty: number; freeToUseQty: number }>();
  for (const product of products) {
    stocks.set(product.id, { onHandQty: 0, reservedQty: 0, freeToUseQty: 0 });
  }

  for (const row of movementRows) {
    const stock = stocks.get(row.productId);
    if (!stock) continue;
    const quantity = row._sum.quantity ?? 0;
    if (POSITIVE_TYPES.includes(row.movementType)) stock.onHandQty += quantity;
    else if (NEGATIVE_TYPES.includes(row.movementType)) stock.onHandQty -= quantity;
    else stock.onHandQty += quantity;
  }

  for (const row of reservationRows) {
    const stock = stocks.get(row.productId);
    if (!stock) continue;
    stock.reservedQty = Math.max(0, (row._sum.quantity ?? 0) - (row._sum.deliveredQty ?? 0));
  }

  for (const stock of stocks.values()) {
    stock.freeToUseQty = stock.onHandQty - stock.reservedQty;
  }

  return stocks;
}

async function attachStock(products: ProductForStock[]) {
  const productIds = products.map((product) => product.id);
  if (productIds.length === 0) return [];

  const [movementRows, reservationRows] = await Promise.all([
    prisma.inventoryMovement.groupBy({
      by: ["productId", "movementType"],
      where: { deletedAt: null, productId: { in: productIds } },
      _sum: { quantity: true },
    }),
    prisma.salesOrderItem.groupBy({
      by: ["productId"],
      where: {
        deletedAt: null,
        productId: { in: productIds },
        salesOrder: { deletedAt: null, status: { in: ["CONFIRMED", "PARTIALLY_DELIVERED"] } },
      },
      _sum: { quantity: true, deliveredQty: true },
    }),
  ]);

  const stocks = stockByProduct(products, movementRows, reservationRows);
  return products.map((product) => ({
    sku: product.sku,
    name: product.name,
    productType: product.productType,
    reorderPoint: product.reorderPoint,
    procureOnDemand: product.procureOnDemand,
    procurementMode: product.procurementMode,
    supplyStrategy: product.supplyStrategy,
    preferredVendor: product.preferredVendor?.name,
    ...stocks.get(product.id),
  }));
}

function statusCounts(rows: Array<{ status: string; _count: { _all: number } }>) {
  return Object.fromEntries(rows.map((row) => [row.status, row._count._all]));
}

export class AssistantRepository {
  async replaceChunks(chunks: AssistantChunkInput[]) {
    await prisma.$transaction([
      prisma.assistantDocumentChunk.deleteMany({}),
      ...chunks.map((chunk) =>
        prisma.assistantDocumentChunk.create({
          data: {
            sourcePath: chunk.sourcePath,
            chunkIndex: chunk.chunkIndex,
            title: chunk.title,
            content: chunk.content,
            contentHash: chunk.contentHash,
            embedding: toJsonEmbedding(chunk.embedding),
          },
        }),
      ),
    ]);
  }

  async listChunks() {
    return prisma.assistantDocumentChunk.findMany({
      orderBy: [{ sourcePath: "asc" }, { chunkIndex: "asc" }],
    });
  }

  async countChunks() {
    return prisma.assistantDocumentChunk.count();
  }

  async loadLiveContext(roleName: RoleName, route?: string) {
    const broad = roleName === "ADMIN" || roleName === "BUSINESS_OWNER";
    const allowSales = broad || roleName === "SALES_USER";
    const allowPurchases = broad || roleName === "PURCHASE_USER";
    const allowManufacturing = broad || roleName === "MANUFACTURING_USER";
    const allowInventory = broad || roleName === "INVENTORY_MANAGER" || roleName === "SALES_USER" || roleName === "PURCHASE_USER" || roleName === "MANUFACTURING_USER";
    const allowProcurement = broad || roleName === "PURCHASE_USER" || roleName === "INVENTORY_MANAGER";
    const context: Record<string, unknown> = { role: roleName, currentRoute: route ?? "unknown" };

    const products = allowInventory
      ? await prisma.product.findMany({
          where: { deletedAt: null },
          select: {
            id: true,
            sku: true,
            name: true,
            productType: true,
            reorderPoint: true,
            procureOnDemand: true,
            procurementMode: true,
            supplyStrategy: true,
            preferredVendor: { select: { name: true } },
          },
          orderBy: { name: "asc" },
          take: 50,
        })
      : [];
    const productsWithStock = await attachStock(products);

    if (allowInventory) {
      context["stock"] = {
        lowStockProducts: productsWithStock
          .filter((product) => (product.freeToUseQty ?? 0) < product.reorderPoint)
          .slice(0, 12),
        products: productsWithStock.slice(0, 20),
      };
    }

    if (allowSales) {
      const [total, byStatus, pendingDeliveries, salesOrders] = await Promise.all([
        prisma.salesOrder.count({ where: { deletedAt: null } }),
        prisma.salesOrder.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } }),
        prisma.salesOrder.count({ where: { deletedAt: null, status: { in: ["CONFIRMED", "PARTIALLY_DELIVERED"] } } }),
        prisma.salesOrder.findMany({
          where: { deletedAt: null },
          select: {
            orderNumber: true,
            status: true,
            orderDate: true,
            requestedDate: true,
            customer: { select: { name: true } },
            items: {
              where: { deletedAt: null },
              select: {
                quantity: true,
                deliveredQty: true,
                unitPrice: true,
                product: { select: { sku: true, name: true } },
              },
            },
          },
          orderBy: { orderDate: "desc" },
          take: 8,
        }),
      ]);
      context["sales"] = { total, byStatus: statusCounts(byStatus), pendingDeliveries, recentOrders: salesOrders };
    }

    if (allowPurchases) {
      const [total, byStatus, partialReceipts, purchaseOrders] = await Promise.all([
        prisma.purchaseOrder.count({ where: { deletedAt: null } }),
        prisma.purchaseOrder.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } }),
        prisma.purchaseOrder.count({ where: { deletedAt: null, status: "PARTIALLY_RECEIVED" } }),
        prisma.purchaseOrder.findMany({
          where: { deletedAt: null },
          select: {
            orderNumber: true,
            status: true,
            orderDate: true,
            expectedDate: true,
            vendor: { select: { name: true } },
            items: {
              where: { deletedAt: null },
              select: {
                quantity: true,
                receivedQty: true,
                unitCost: true,
                product: { select: { sku: true, name: true } },
              },
            },
          },
          orderBy: { orderDate: "desc" },
          take: 8,
        }),
      ]);
      context["purchases"] = { total, byStatus: statusCounts(byStatus), partialReceipts, recentOrders: purchaseOrders };
    }

    if (allowManufacturing) {
      const [total, byStatus, inProgress, manufacturingOrders, billsOfMaterial] = await Promise.all([
        prisma.manufacturingOrder.count({ where: { deletedAt: null } }),
        prisma.manufacturingOrder.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } }),
        prisma.manufacturingOrder.count({ where: { deletedAt: null, status: "IN_PROGRESS" } }),
        prisma.manufacturingOrder.findMany({
          where: { deletedAt: null },
          select: {
            orderNumber: true,
            quantity: true,
            status: true,
            plannedStartDate: true,
            plannedFinishDate: true,
            product: { select: { sku: true, name: true } },
            workOrders: {
              where: { deletedAt: null },
              select: { operationName: true, sequence: true, status: true, workCenter: { select: { name: true } } },
              orderBy: { sequence: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.billOfMaterial.findMany({
          where: { deletedAt: null, isActive: true },
          select: {
            name: true,
            version: true,
            product: { select: { sku: true, name: true } },
            items: {
              where: { deletedAt: null },
              select: {
                quantity: true,
                scrapPercentage: true,
                product: { select: { sku: true, name: true } },
              },
            },
          },
          take: 8,
        }),
      ]);
      context["manufacturing"] = {
        total,
        byStatus: statusCounts(byStatus),
        inProgress,
        recentOrders: manufacturingOrders,
        activeBillsOfMaterial: billsOfMaterial.map((bom) => ({
          ...bom,
          items: bom.items.map((item) => ({ ...item, scrapPercentage: decimalToNumber(item.scrapPercentage) })),
        })),
      };
    }

    if (allowProcurement) {
      const [rules, recentActions] = await Promise.all([
        prisma.product.findMany({
          where: { deletedAt: null, procureOnDemand: true },
          select: {
            sku: true,
            name: true,
            procurementMode: true,
            supplyStrategy: true,
            preferredVendor: { select: { name: true } },
          },
          orderBy: { name: "asc" },
          take: 20,
        }),
        prisma.auditLog.findMany({
          where: { deletedAt: null, entityType: "Procurement", summary: { startsWith: "Auto-procurement" } },
          select: { eventType: true, entityType: true, summary: true, occurredAt: true },
          orderBy: { occurredAt: "desc" },
          take: 10,
        }),
      ]);
      context["procurement"] = { rules, recentActions };
    }

    if (broad) {
      context["audit"] = await prisma.auditLog.findMany({
        where: { deletedAt: null },
        select: { eventType: true, entityType: true, summary: true, occurredAt: true },
        orderBy: { occurredAt: "desc" },
        take: 12,
      });
    }

    return context;
  }
}
