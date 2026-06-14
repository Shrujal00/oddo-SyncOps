import type { SalesOrderStatus } from "@prisma/client";
import { HttpError } from "../../common/exceptions/http-error.js";
import { AuditRepository } from "../audit/repository.js";
import { InventoryRepository } from "../inventory/repository.js";
import { ProcurementService } from "../procurement/service.js";
import type {
  CancelSalesOrderDto,
  ConfirmSalesOrderDto,
  CreateSalesOrderDto,
  DeliverSalesOrderDto,
  SalesOrderListResponseDto,
  SalesOrderResponseDto,
  UpdateSalesOrderDto,
} from "./dto.js";
import { SalesRepository, type SalesOrderWithRelations } from "./repository.js";

function toNum(v: unknown): number {
  return Number(v ?? 0);
}

function toDto(order: SalesOrderWithRelations): SalesOrderResponseDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customer: order.customer,
    status: order.status,
    orderDate: order.orderDate.toISOString(),
    requestedDate: order.requestedDate?.toISOString(),
    notes: order.notes ?? undefined,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: item.product,
      quantity: item.quantity,
      deliveredQty: item.deliveredQty,
      unitPrice: toNum(item.unitPrice),
    })),
    totalValue: order.items.reduce((sum, item) => sum + item.quantity * toNum(item.unitPrice), 0),
  };
}

export class SalesService {
  constructor(
    private readonly repository = new SalesRepository(),
    private readonly inventoryRepo = new InventoryRepository(),
    private readonly auditRepo = new AuditRepository(),
    private readonly procurementService = new ProcurementService(),
  ) {}

  async list(): Promise<SalesOrderListResponseDto> {
    const salesOrders = await this.repository.listSalesOrders();
    return { salesOrders: salesOrders.map(toDto) };
  }

  async create(dto: CreateSalesOrderDto): Promise<SalesOrderResponseDto> {
    const customerExists = await this.repository.customerExists(dto.customerId);
    if (!customerExists) throw new HttpError(400, "Customer not found");
    return toDto(await this.repository.create(dto));
  }

  async update(id: string, dto: UpdateSalesOrderDto): Promise<SalesOrderResponseDto> {
    const order = await this.repository.findById(id);
    if (order.status !== "DRAFT") throw new HttpError(400, "Only draft sales orders can be updated");
    return toDto(await this.repository.update(id, dto));
  }

  async confirm(id: string, dto: ConfirmSalesOrderDto): Promise<SalesOrderResponseDto> {
    const order = await this.repository.findById(id);
    if (order.status !== "DRAFT") throw new HttpError(400, "Only draft sales orders can be confirmed");

    const confirmed = await this.repository.updateStatus(id, "CONFIRMED");
    await Promise.all(
      confirmed.items.map(async (item) => {
        const stock = await this.inventoryRepo.getStockSummary(item.productId);
        if (stock.freeToUseQty < item.quantity && item.product.procureOnDemand) {
          await this.procurementService.triggerProcurement({
            salesOrderId: id,
            productId: item.productId,
            requiredQty: item.quantity,
            availableQty: stock.freeToUseQty,
          }, dto.confirmedBy);
        }
      }),
    );
    await this.auditRepo.record({
      eventType: "SALES_ORDER_CHANGED",
      entityType: "SalesOrder",
      entityId: id,
      summary: "Confirmed",
      userId: dto.confirmedBy,
    });
    return toDto(confirmed);
  }

  async deliver(id: string, dto: DeliverSalesOrderDto): Promise<SalesOrderResponseDto> {
    const order = await this.repository.findById(id);
    if (!["CONFIRMED", "PARTIALLY_DELIVERED"].includes(order.status)) {
      throw new HttpError(400, "Only confirmed sales orders can be delivered");
    }

    const quantities = new Map<string, number>();
    for (const item of dto.deliveredItems) {
      quantities.set(item.salesOrderItemId, (quantities.get(item.salesOrderItemId) ?? 0) + item.quantity);
    }

    for (const [itemId, quantity] of quantities) {
      const item = order.items.find((i) => i.id === itemId);
      if (!item) throw new HttpError(400, "Sales order item not found");
      const remaining = item.quantity - item.deliveredQty;
      if (quantity > remaining) throw new HttpError(400, "Delivered quantity exceeds remaining quantity");

      await this.inventoryRepo.recordMovement({
        productId: item.productId,
        movementType: "SALE",
        quantity,
        referenceType: "SalesOrder",
        referenceId: id,
        notes: `Delivery for ${order.orderNumber}`,
      });
      await this.repository.updateItemDeliveredQty(itemId, quantity);
    }

    const updated = await this.repository.findById(id);
    const nextStatus: SalesOrderStatus = updated.items.every((item) => item.deliveredQty >= item.quantity)
      ? "DELIVERED"
      : "PARTIALLY_DELIVERED";
    const finalOrder = await this.repository.updateStatus(id, nextStatus);
    await this.auditRepo.record({
      eventType: "SALES_ORDER_CHANGED",
      entityType: "SalesOrder",
      entityId: id,
      summary: `Delivered items; status ${nextStatus}`,
      userId: dto.deliveredBy,
    });
    await this.auditRepo.record({
      eventType: "INVENTORY_CHANGED",
      entityType: "SalesOrder",
      entityId: id,
      summary: `Recorded sale movements for ${quantities.size} item(s)`,
      userId: dto.deliveredBy,
    });
    return toDto(finalOrder);
  }

  async cancel(id: string, dto: CancelSalesOrderDto): Promise<SalesOrderResponseDto> {
    const order = await this.repository.findById(id);
    if (!["DRAFT", "CONFIRMED"].includes(order.status)) {
      throw new HttpError(400, "Only draft or confirmed sales orders can be cancelled");
    }
    const cancelled = await this.repository.updateStatus(id, "CANCELLED");
    await this.auditRepo.record({
      eventType: "SALES_ORDER_CHANGED",
      entityType: "SalesOrder",
      entityId: id,
      summary: `Cancelled: ${dto.reason}`,
      userId: dto.cancelledBy,
    });
    return toDto(cancelled);
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.repository.softDelete(id);
    return { id };
  }
}
