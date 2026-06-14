import type { Prisma, PurchaseOrderStatus } from "@prisma/client";
import { prisma } from "../../database/prisma.js";
import { HttpError } from "../../common/exceptions/http-error.js";
import type { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from "./dto.js";

const purchaseOrderInclude = {
  vendor: { select: { id: true, name: true } },
  items: {
    where: { deletedAt: null },
    include: { product: { select: { id: true, sku: true, name: true } } },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.PurchaseOrderInclude;

export type PurchaseOrderWithRelations = Prisma.PurchaseOrderGetPayload<{ include: typeof purchaseOrderInclude }>;

function orderNumberPrefix() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `PO-${yyyy}${mm}${dd}`;
}

function itemCreateManyData(items: CreatePurchaseOrderDto["items"]) {
  return items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitCost: item.unitCost,
  }));
}

export class PurchasesRepository {
  async listPurchaseOrders() {
    return prisma.purchaseOrder.findMany({
      where: { deletedAt: null },
      include: purchaseOrderInclude,
      orderBy: { orderDate: "desc" },
    });
  }

  async findById(id: string) {
    const order = await prisma.purchaseOrder.findFirst({
      where: { id, deletedAt: null },
      include: purchaseOrderInclude,
    });
    if (!order) throw new HttpError(404, "Purchase order not found");
    return order;
  }

  async vendorExists(vendorId: string) {
    const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, deletedAt: null } });
    return Boolean(vendor);
  }

  async create(data: CreatePurchaseOrderDto) {
    const prefix = orderNumberPrefix();
    const count = await prisma.purchaseOrder.count({
      where: { orderNumber: { startsWith: prefix } },
    });
    return prisma.purchaseOrder.create({
      data: {
        orderNumber: `${prefix}-${String(count + 1).padStart(4, "0")}`,
        vendorId: data.vendorId,
        orderDate: new Date(data.orderDate),
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        notes: data.notes,
        items: { createMany: { data: itemCreateManyData(data.items) } },
      },
      include: purchaseOrderInclude,
    });
  }

  async update(id: string, data: UpdatePurchaseOrderDto) {
    await this.findById(id);
    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...(data.expectedDate !== undefined && {
          expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.items !== undefined && {
          items: {
            deleteMany: {},
            createMany: { data: itemCreateManyData(data.items) },
          },
        }),
      },
      include: purchaseOrderInclude,
    });
  }

  async updateStatus(id: string, status: PurchaseOrderStatus) {
    await this.findById(id);
    return prisma.purchaseOrder.update({
      where: { id },
      data: { status },
      include: purchaseOrderInclude,
    });
  }

  async updateItemReceivedQty(itemId: string, qty: number) {
    return prisma.purchaseOrderItem.update({
      where: { id: itemId },
      data: { receivedQty: { increment: qty } },
    });
  }

  async softDelete(id: string) {
    await this.findById(id);
    return prisma.purchaseOrder.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
