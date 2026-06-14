import type { ManufacturingStatus, Prisma, WorkOrderStatus } from "@prisma/client";
import { HttpError } from "../../common/exceptions/http-error.js";
import { prisma } from "../../database/prisma.js";
import type { CreateManufacturingOrderDto, CreateWorkCenterDto, UpdateWorkCenterDto } from "./dto.js";

const manufacturingOrderInclude = {
  product: { select: { id: true, sku: true, name: true, activeBomId: true } },
  workOrders: {
    where: { deletedAt: null },
    include: { workCenter: { select: { id: true, name: true } } },
    orderBy: { sequence: "asc" as const },
  },
} satisfies Prisma.ManufacturingOrderInclude;

const billOfMaterialInclude = {
  items: {
    where: { deletedAt: null },
    include: { product: { select: { id: true, sku: true, name: true } } },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.BillOfMaterialInclude;

export type ManufacturingOrderWithRelations = Prisma.ManufacturingOrderGetPayload<{ include: typeof manufacturingOrderInclude }>;
export type ActiveBillOfMaterial = Prisma.BillOfMaterialGetPayload<{ include: typeof billOfMaterialInclude }>;

function orderNumberPrefix() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `MO-${yyyy}${mm}${dd}`;
}

function workOrderData(dto: CreateManufacturingOrderDto) {
  const operations = dto.operations?.length
    ? dto.operations
    : [{ operationName: "Manufacture", sequence: 1 }];
  return operations.map((operation) => ({
    operationName: operation.operationName,
    sequence: operation.sequence,
    plannedDurationMins: operation.plannedDurationMins,
    workCenterId: operation.workCenterId,
    status: "PLANNED" as WorkOrderStatus,
  }));
}

export class ManufacturingRepository {
  async listManufacturingOrders() {
    return prisma.manufacturingOrder.findMany({
      where: { deletedAt: null },
      include: manufacturingOrderInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const order = await prisma.manufacturingOrder.findFirst({
      where: { id, deletedAt: null },
      include: manufacturingOrderInclude,
    });
    if (!order) throw new HttpError(404, "Manufacturing order not found");
    return order;
  }

  async findActiveBomForProduct(productId: string): Promise<ActiveBillOfMaterial> {
    const product = await prisma.product.findFirst({ where: { id: productId, deletedAt: null } });
    if (!product) throw new HttpError(404, "Product not found");

    const bom = product.activeBomId
      ? await prisma.billOfMaterial.findFirst({
          where: { id: product.activeBomId, deletedAt: null },
          include: billOfMaterialInclude,
        })
      : await prisma.billOfMaterial.findFirst({
          where: { productId, isActive: true, deletedAt: null },
          include: billOfMaterialInclude,
          orderBy: { createdAt: "desc" },
        });
    if (!bom) throw new HttpError(422, "Product has no active bill of material");
    return bom;
  }

  async workCenterExists(id: string) {
    const workCenter = await prisma.workCenter.findFirst({ where: { id, deletedAt: null } });
    return Boolean(workCenter);
  }

  async create(dto: CreateManufacturingOrderDto) {
    const prefix = orderNumberPrefix();
    const count = await prisma.manufacturingOrder.count({ where: { orderNumber: { startsWith: prefix } } });
    return prisma.manufacturingOrder.create({
      data: {
        orderNumber: `${prefix}-${String(count + 1).padStart(4, "0")}`,
        productId: dto.productId,
        quantity: dto.quantity,
        plannedStartDate: dto.plannedStartDate ? new Date(dto.plannedStartDate) : null,
        plannedFinishDate: dto.plannedFinishDate ? new Date(dto.plannedFinishDate) : null,
        workOrders: { createMany: { data: workOrderData(dto) } },
      },
      include: manufacturingOrderInclude,
    });
  }

  async updateStatus(id: string, status: ManufacturingStatus) {
    await this.findById(id);
    return prisma.manufacturingOrder.update({
      where: { id },
      data: { status },
      include: manufacturingOrderInclude,
    });
  }

  async releaseWorkOrders(manufacturingOrderId: string) {
    await prisma.workOrder.updateMany({
      where: { manufacturingOrderId, deletedAt: null, status: "PLANNED" },
      data: { status: "RELEASED" },
    });
  }

  async completeWorkOrders(manufacturingOrderId: string) {
    await prisma.workOrder.updateMany({
      where: { manufacturingOrderId, deletedAt: null },
      data: { status: "COMPLETED" },
    });
  }

  async updateWorkOrderStatus(manufacturingOrderId: string, workOrderId: string, status: WorkOrderStatus) {
    const workOrder = await prisma.workOrder.findFirst({
      where: { id: workOrderId, manufacturingOrderId, deletedAt: null },
    });
    if (!workOrder) throw new HttpError(404, "Work order not found");
    return prisma.workOrder.update({ where: { id: workOrderId }, data: { status } });
  }

  async listWorkCenters() {
    return prisma.workCenter.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    });
  }

  async createWorkCenter(dto: CreateWorkCenterDto) {
    return prisma.workCenter.create({ data: dto });
  }

  async updateWorkCenter(id: string, dto: UpdateWorkCenterDto) {
    const workCenter = await prisma.workCenter.findFirst({ where: { id, deletedAt: null } });
    if (!workCenter) throw new HttpError(404, "Work center not found");
    return prisma.workCenter.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  async softDelete(id: string) {
    await this.findById(id);
    return prisma.manufacturingOrder.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
