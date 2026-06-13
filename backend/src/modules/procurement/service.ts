import { HttpError } from "../../common/exceptions/http-error.js";
import { AuditRepository } from "../audit/repository.js";
import { InventoryRepository } from "../inventory/repository.js";
import { ManufacturingService } from "../manufacturing/service.js";
import { PurchasesService } from "../purchases/service.js";
import type {
  ProcurementActionResponseDto,
  ProcurementDemandDto,
  ProcurementPlanResponseDto,
  ProcurementTriggerDemandDto,
} from "./dto.js";
import { ProcurementRepository } from "./repository.js";

export class ProcurementService {
  constructor(
    private readonly repository = new ProcurementRepository(),
    private readonly inventoryRepo = new InventoryRepository(),
    private readonly purchasesService = new PurchasesService(),
    private readonly manufacturingService = new ManufacturingService(),
    private readonly auditRepo = new AuditRepository(),
  ) {}

  async listRules() {
    return this.repository.listRules();
  }

  async listActions(): Promise<ProcurementActionResponseDto[]> {
    const logs = await this.repository.listAutoActions();
    return logs.map((log) => {
      const metadata = (log.metadata ?? {}) as Record<string, string>;
      return {
        id: log.id,
        salesOrderId: log.entityId ?? undefined,
        productId: metadata.productId,
        actionType: metadata.actionType as ProcurementActionResponseDto["actionType"],
        createdEntityType: metadata.createdEntityType as ProcurementActionResponseDto["createdEntityType"],
        createdEntityId: metadata.createdEntityId,
        summary: log.summary,
        occurredAt: log.occurredAt.toISOString(),
      };
    });
  }

  async plan(dto: ProcurementDemandDto): Promise<ProcurementPlanResponseDto> {
    const stock = await this.inventoryRepo.getStockSummary(dto.productId);
    const shortageQuantity = Math.max(0, dto.requiredQuantity - stock.freeToUseQty);
    return {
      evaluations: [{
        demand: dto,
        availableQuantity: stock.freeToUseQty,
        shortageQuantity,
        recommendedAction: shortageQuantity <= 0
          ? "RESERVE_STOCK"
          : dto.mode === "MTO"
            ? "CREATE_MANUFACTURING_ORDER"
            : "CREATE_PURCHASE_ORDER",
      }],
    };
  }

  async triggerProcurement(demand: ProcurementTriggerDemandDto, userId?: string): Promise<void> {
    const product = await this.repository.getProduct(demand.productId);
    if (!product) throw new HttpError(404, "Product not found");
    if (!product.procureOnDemand) return;

    const shortfallQty = Math.max(0, demand.requiredQty - demand.availableQty);
    if (shortfallQty <= 0) return;

    if (product.supplyStrategy === "BUY") {
      if (!product.preferredVendorId) {
        throw new HttpError(422, `Product ${product.sku} requires a preferred vendor for auto-procurement`);
      }
      const purchaseOrder = await this.purchasesService.create({
        vendorId: product.preferredVendorId,
        orderDate: new Date().toISOString(),
        notes: `Auto-procurement for Sales Order ${demand.salesOrderId}`,
        items: [{
          productId: product.id,
          quantity: shortfallQty,
          unitCost: Number(product.standardCost),
        }],
      });
      await this.auditProcurement(demand, userId, "CREATE_PURCHASE_ORDER", "PurchaseOrder", purchaseOrder.id, shortfallQty);
      return;
    }

    if (!product.activeBomId) {
      throw new HttpError(422, `Product ${product.sku} requires an active BoM for auto-procurement`);
    }
    const manufacturingOrder = await this.manufacturingService.create({
      productId: product.id,
      quantity: shortfallQty,
      notes: `Auto-procurement for Sales Order ${demand.salesOrderId}`,
    });
    await this.auditProcurement(demand, userId, "CREATE_MANUFACTURING_ORDER", "ManufacturingOrder", manufacturingOrder.id, shortfallQty);
  }

  private async auditProcurement(
    demand: ProcurementTriggerDemandDto,
    userId: string | undefined,
    actionType: "CREATE_PURCHASE_ORDER" | "CREATE_MANUFACTURING_ORDER",
    createdEntityType: "PurchaseOrder" | "ManufacturingOrder",
    createdEntityId: string,
    shortfallQty: number,
  ) {
    await this.auditRepo.record({
      eventType: "SALES_ORDER_CHANGED",
      entityType: "Procurement",
      entityId: demand.salesOrderId,
      summary: `Auto-procurement created ${createdEntityType} for ${shortfallQty} unit(s)`,
      userId,
      metadata: {
        salesOrderId: demand.salesOrderId,
        productId: demand.productId,
        actionType,
        createdEntityType,
        createdEntityId,
        shortfallQty,
      },
    });
  }
}
