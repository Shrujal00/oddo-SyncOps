import type { PurchaseOrderStatus } from "@prisma/client";
import { HttpError } from "../../common/exceptions/http-error.js";
import { AuditRepository } from "../audit/repository.js";
import { InventoryRepository } from "../inventory/repository.js";
import type {
  CancelPurchaseOrderDto,
  ConfirmPurchaseOrderDto,
  CreatePurchaseOrderDto,
  PurchaseOrderListResponseDto,
  PurchaseOrderResponseDto,
  ReceivePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from "./dto.js";
import { PurchasesRepository, type PurchaseOrderWithRelations } from "./repository.js";

function toNum(v: unknown): number {
  return Number(v ?? 0);
}

function toDto(order: PurchaseOrderWithRelations): PurchaseOrderResponseDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    vendorId: order.vendorId,
    vendor: order.vendor,
    status: order.status,
    orderDate: order.orderDate.toISOString(),
    expectedDate: order.expectedDate?.toISOString(),
    notes: order.notes ?? undefined,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: item.product,
      quantity: item.quantity,
      receivedQty: item.receivedQty,
      unitCost: toNum(item.unitCost),
    })),
    totalValue: order.items.reduce((sum, item) => sum + item.quantity * toNum(item.unitCost), 0),
  };
}

export class PurchasesService {
  constructor(
    private readonly repository = new PurchasesRepository(),
    private readonly inventoryRepo = new InventoryRepository(),
    private readonly auditRepo = new AuditRepository(),
  ) {}

  async list(): Promise<PurchaseOrderListResponseDto> {
    const purchaseOrders = await this.repository.listPurchaseOrders();
    return { purchaseOrders: purchaseOrders.map(toDto) };
  }

  async create(dto: CreatePurchaseOrderDto): Promise<PurchaseOrderResponseDto> {
    const vendorExists = await this.repository.vendorExists(dto.vendorId);
    if (!vendorExists) throw new HttpError(400, "Vendor not found");
    return toDto(await this.repository.create(dto));
  }

  async update(id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrderResponseDto> {
    const order = await this.repository.findById(id);
    if (order.status !== "DRAFT") throw new HttpError(400, "Only draft purchase orders can be updated");
    return toDto(await this.repository.update(id, dto));
  }

  async confirm(id: string, dto: ConfirmPurchaseOrderDto): Promise<PurchaseOrderResponseDto> {
    const order = await this.repository.findById(id);
    if (order.status !== "DRAFT") throw new HttpError(400, "Only draft purchase orders can be confirmed");
    const confirmed = await this.repository.updateStatus(id, "CONFIRMED");
    await this.auditRepo.record({
      eventType: "PURCHASE_ORDER_CHANGED",
      entityType: "PurchaseOrder",
      entityId: id,
      summary: "Confirmed",
      userId: dto.confirmedBy,
    });
    return toDto(confirmed);
  }

  async receive(id: string, dto: ReceivePurchaseOrderDto): Promise<PurchaseOrderResponseDto> {
    const order = await this.repository.findById(id);
    if (!["CONFIRMED", "PARTIALLY_RECEIVED"].includes(order.status)) {
      throw new HttpError(400, "Only confirmed purchase orders can be received");
    }

    const quantities = new Map<string, number>();
    for (const item of dto.receivedItems) {
      quantities.set(item.purchaseOrderItemId, (quantities.get(item.purchaseOrderItemId) ?? 0) + item.quantity);
    }

    for (const [itemId, quantity] of quantities) {
      const item = order.items.find((i) => i.id === itemId);
      if (!item) throw new HttpError(400, "Purchase order item not found");
      const remaining = item.quantity - item.receivedQty;
      if (quantity > remaining) throw new HttpError(400, "Received quantity exceeds remaining quantity");

      await this.inventoryRepo.recordMovement({
        productId: item.productId,
        movementType: "PURCHASE",
        quantity,
        referenceType: "PurchaseOrder",
        referenceId: id,
        notes: `Receipt for ${order.orderNumber}`,
      });
      await this.repository.updateItemReceivedQty(itemId, quantity);
    }

    const updated = await this.repository.findById(id);
    const nextStatus: PurchaseOrderStatus = updated.items.every((item) => item.receivedQty >= item.quantity)
      ? "RECEIVED"
      : "PARTIALLY_RECEIVED";
    const finalOrder = await this.repository.updateStatus(id, nextStatus);
    await this.auditRepo.record({
      eventType: "PURCHASE_ORDER_CHANGED",
      entityType: "PurchaseOrder",
      entityId: id,
      summary: `Received items; status ${nextStatus}`,
      userId: dto.receivedBy,
    });
    await this.auditRepo.record({
      eventType: "INVENTORY_CHANGED",
      entityType: "PurchaseOrder",
      entityId: id,
      summary: `Recorded purchase movements for ${quantities.size} item(s)`,
      userId: dto.receivedBy,
    });
    return toDto(finalOrder);
  }

  async cancel(id: string, dto: CancelPurchaseOrderDto): Promise<PurchaseOrderResponseDto> {
    const order = await this.repository.findById(id);
    if (!["DRAFT", "CONFIRMED"].includes(order.status)) {
      throw new HttpError(400, "Only draft or confirmed purchase orders can be cancelled");
    }
    const cancelled = await this.repository.updateStatus(id, "CANCELLED");
    await this.auditRepo.record({
      eventType: "PURCHASE_ORDER_CHANGED",
      entityType: "PurchaseOrder",
      entityId: id,
      summary: `Cancelled: ${dto.reason}`,
      userId: dto.cancelledBy,
    });
    return toDto(cancelled);
  }
}
