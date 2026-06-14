import { HttpError } from "../../common/exceptions/http-error.js";
import { AuditRepository } from "../audit/repository.js";
import { InventoryRepository } from "../inventory/repository.js";
import type {
  ConfirmManufacturingDto,
  CompleteManufacturingDto,
  CreateManufacturingOrderDto,
  CreateWorkCenterDto,
  ManufacturingOrderResponseDto,
  StartManufacturingDto,
  UpdateWorkCenterDto,
  UpdateWorkOrderDto,
  WorkCenterDto,
} from "./dto.js";
import { ManufacturingRepository, type ActiveBillOfMaterial, type ManufacturingOrderWithRelations } from "./repository.js";

function toNum(value: unknown): number {
  return Number(value ?? 0);
}

function toDto(order: ManufacturingOrderWithRelations, warnings?: string[]): ManufacturingOrderResponseDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    productId: order.productId,
    product: order.product,
    quantity: order.quantity,
    status: order.status,
    plannedStartDate: order.plannedStartDate?.toISOString(),
    plannedFinishDate: order.plannedFinishDate?.toISOString(),
    workOrders: order.workOrders.map((workOrder) => ({
      id: workOrder.id,
      operationName: workOrder.operationName,
      sequence: workOrder.sequence,
      plannedDurationMins: workOrder.plannedDurationMins ?? undefined,
      workCenterId: workOrder.workCenterId ?? undefined,
      workCenter: workOrder.workCenter ?? undefined,
      status: workOrder.status,
    })),
    ...(warnings?.length && { warnings }),
  };
}

function toWorkCenterDto(workCenter: { id: string; name: string; description: string | null }): WorkCenterDto {
  return {
    id: workCenter.id,
    name: workCenter.name,
    description: workCenter.description ?? undefined,
  };
}

export class ManufacturingService {
  constructor(
    private readonly repository = new ManufacturingRepository(),
    private readonly inventoryRepo = new InventoryRepository(),
    private readonly auditRepo = new AuditRepository(),
  ) {}

  async list(): Promise<ManufacturingOrderResponseDto[]> {
    const orders = await this.repository.listManufacturingOrders();
    return orders.map((order) => toDto(order));
  }

  async create(dto: CreateManufacturingOrderDto): Promise<ManufacturingOrderResponseDto> {
    await this.repository.findActiveBomForProduct(dto.productId);
    for (const operation of dto.operations ?? []) {
      if (operation.workCenterId && !(await this.repository.workCenterExists(operation.workCenterId))) {
        throw new HttpError(400, `Work center not found: ${operation.workCenterId}`);
      }
    }
    return toDto(await this.repository.create(dto));
  }

  async confirm(id: string, dto: ConfirmManufacturingDto): Promise<ManufacturingOrderResponseDto> {
    const order = await this.repository.findById(id);
    if (order.status !== "DRAFT") throw new HttpError(400, "Only draft manufacturing orders can be confirmed");

    const bom = await this.repository.findActiveBomForProduct(order.productId);
    const warnings = await this.componentWarnings(bom, order.quantity);
    const confirmed = await this.repository.updateStatus(id, "CONFIRMED");
    await this.auditRepo.record({
      eventType: "MANUFACTURING_CONFIRMED",
      entityType: "ManufacturingOrder",
      entityId: id,
      summary: "Confirmed",
      userId: dto.confirmedBy,
      metadata: warnings.length ? { warnings } : undefined,
    });
    return toDto(confirmed, warnings);
  }

  async start(id: string, dto: StartManufacturingDto): Promise<ManufacturingOrderResponseDto> {
    const order = await this.repository.findById(id);
    if (order.status !== "CONFIRMED") throw new HttpError(400, "Only confirmed manufacturing orders can be started");
    await this.repository.releaseWorkOrders(id);
    const started = await this.repository.updateStatus(id, "IN_PROGRESS");
    await this.auditRepo.record({
      eventType: "MANUFACTURING_STARTED",
      entityType: "ManufacturingOrder",
      entityId: id,
      summary: "Started",
      userId: dto.startedBy,
      occurredAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
    });
    return toDto(started);
  }

  async complete(id: string, dto: CompleteManufacturingDto): Promise<ManufacturingOrderResponseDto> {
    const order = await this.repository.findById(id);
    if (order.status !== "IN_PROGRESS") throw new HttpError(400, "Only in-progress manufacturing orders can be completed");
    if (dto.producedQuantity > order.quantity) {
      throw new HttpError(400, `Produced quantity (${dto.producedQuantity}) cannot exceed order quantity (${order.quantity})`);
    }
    const bom = await this.repository.findActiveBomForProduct(order.productId);

    const consumptions: Array<{ productId: string; quantity: number }> = [];
    for (const component of bom.items) {
      const scrapMultiplier = 1 + toNum(component.scrapPercentage) / 100;
      const quantity = Math.ceil(component.quantity * order.quantity * scrapMultiplier);
      const stock = await this.inventoryRepo.getStockSummary(component.productId);
      if (stock.onHandQty < quantity) {
        throw new HttpError(
          400,
          `Insufficient raw material ${component.product.sku}: ${stock.onHandQty} on hand, ${quantity} required`,
        );
      }
      consumptions.push({ productId: component.productId, quantity });
    }

    for (const { productId, quantity } of consumptions) {
      await this.inventoryRepo.recordMovement({
        productId,
        movementType: "CONSUMPTION",
        quantity,
        referenceType: "ManufacturingOrder",
        referenceId: id,
        notes: `Consumption for ${order.orderNumber}`,
        occurredAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
      });
    }

    await this.inventoryRepo.recordMovement({
      productId: order.productId,
      movementType: "PRODUCTION",
      quantity: dto.producedQuantity,
      referenceType: "ManufacturingOrder",
      referenceId: id,
      notes: `Production for ${order.orderNumber}`,
      occurredAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
    });

    await this.repository.completeWorkOrders(id);
    const completed = await this.repository.updateStatus(id, "COMPLETED");
    await this.auditRepo.record({
      eventType: "MANUFACTURING_COMPLETED",
      entityType: "ManufacturingOrder",
      entityId: id,
      summary: "Completed",
      userId: dto.completedBy,
      occurredAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
    });
    await this.auditRepo.record({
      eventType: "INVENTORY_CHANGED",
      entityType: "ManufacturingOrder",
      entityId: id,
      summary: "Recorded component consumption and finished production",
      userId: dto.completedBy,
      occurredAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
    });
    return toDto(completed);
  }

  async updateWorkOrder(moId: string, woId: string, dto: UpdateWorkOrderDto): Promise<ManufacturingOrderResponseDto> {
    await this.repository.findById(moId);
    await this.repository.updateWorkOrderStatus(moId, woId, dto.status);
    return toDto(await this.repository.findById(moId));
  }

  async listWorkCenters(): Promise<WorkCenterDto[]> {
    const workCenters = await this.repository.listWorkCenters();
    return workCenters.map(toWorkCenterDto);
  }

  async createWorkCenter(dto: CreateWorkCenterDto): Promise<WorkCenterDto> {
    return toWorkCenterDto(await this.repository.createWorkCenter(dto));
  }

  async updateWorkCenter(id: string, dto: UpdateWorkCenterDto): Promise<WorkCenterDto> {
    return toWorkCenterDto(await this.repository.updateWorkCenter(id, dto));
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.repository.softDelete(id);
    return { id };
  }

  private async componentWarnings(bom: ActiveBillOfMaterial, moQuantity: number) {
    const warnings: string[] = [];
    await Promise.all(
      bom.items.map(async (component) => {
        const requiredQty = Math.ceil(component.quantity * moQuantity * (1 + toNum(component.scrapPercentage) / 100));
        const stock = await this.inventoryRepo.getStockSummary(component.productId);
        if (stock.freeToUseQty < requiredQty) {
          warnings.push(
            `${component.product.sku} short by ${requiredQty - stock.freeToUseQty} (${stock.freeToUseQty} free, ${requiredQty} required)`,
          );
        }
      }),
    );
    return warnings;
  }
}
