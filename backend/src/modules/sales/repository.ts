import type { Prisma, SalesOrderStatus } from "@prisma/client";
import { prisma } from "../../database/prisma.js";
import { HttpError } from "../../common/exceptions/http-error.js";
import type { CreateSalesOrderDto, UpdateSalesOrderDto } from "./dto.js";

const salesOrderInclude = {
  customer: { select: { id: true, name: true } },
  items: {
    where: { deletedAt: null },
    include: { product: { select: { id: true, sku: true, name: true, procureOnDemand: true } } },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.SalesOrderInclude;

export type SalesOrderWithRelations = Prisma.SalesOrderGetPayload<{ include: typeof salesOrderInclude }>;

function orderNumberPrefix() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `SO-${yyyy}${mm}${dd}`;
}

function itemCreateManyData(items: CreateSalesOrderDto["items"]) {
  return items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }));
}

export class SalesRepository {
  async listSalesOrders() {
    return prisma.salesOrder.findMany({
      where: { deletedAt: null },
      include: salesOrderInclude,
      orderBy: { orderDate: "desc" },
    });
  }

  async findById(id: string) {
    const order = await prisma.salesOrder.findFirst({
      where: { id, deletedAt: null },
      include: salesOrderInclude,
    });
    if (!order) throw new HttpError(404, "Sales order not found");
    return order;
  }

  async customerExists(customerId: string) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, deletedAt: null } });
    return Boolean(customer);
  }

  async create(data: CreateSalesOrderDto) {
    const prefix = orderNumberPrefix();
    const count = await prisma.salesOrder.count({
      where: { orderNumber: { startsWith: prefix } },
    });
    return prisma.salesOrder.create({
      data: {
        orderNumber: `${prefix}-${String(count + 1).padStart(4, "0")}`,
        customerId: data.customerId,
        orderDate: new Date(data.orderDate),
        requestedDate: data.requestedDate ? new Date(data.requestedDate) : null,
        notes: data.notes,
        items: { createMany: { data: itemCreateManyData(data.items) } },
      },
      include: salesOrderInclude,
    });
  }

  async update(id: string, data: UpdateSalesOrderDto) {
    await this.findById(id);
    return prisma.salesOrder.update({
      where: { id },
      data: {
        ...(data.requestedDate !== undefined && {
          requestedDate: data.requestedDate ? new Date(data.requestedDate) : null,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.items !== undefined && {
          items: {
            deleteMany: {},
            createMany: { data: itemCreateManyData(data.items) },
          },
        }),
      },
      include: salesOrderInclude,
    });
  }

  async updateStatus(id: string, status: SalesOrderStatus) {
    await this.findById(id);
    return prisma.salesOrder.update({
      where: { id },
      data: { status },
      include: salesOrderInclude,
    });
  }

  async updateItemDeliveredQty(itemId: string, qty: number) {
    return prisma.salesOrderItem.update({
      where: { id: itemId },
      data: { deliveredQty: { increment: qty } },
    });
  }

  async softDelete(id: string) {
    await this.findById(id);
    return prisma.salesOrder.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
