import { InventoryMovementType } from "@prisma/client";
import { notImplemented } from "../../common/exceptions/not-implemented.js";
import { prisma } from "../../database/prisma.js";
import type {
  InventoryLedgerResponseDto,
  StockAdjustmentDto,
  StockReleaseDto,
  StockReservationDto,
} from "./dto.js";
import { InventoryRepository, type ListMovementsFilters } from "./repository.js";

export class InventoryService {
  constructor(private readonly repository = new InventoryRepository()) {}

  async listMovements(filters: ListMovementsFilters) {
    return this.repository.listMovements(filters);
  }

  async ledger(): Promise<InventoryLedgerResponseDto> {
    const result = await this.repository.listMovements({});
    return {
      entries: result.entries.map((e) => ({
        productId: e.productId,
        movementType: e.movementType as InventoryLedgerResponseDto["entries"][number]["movementType"],
        quantity: e.quantity,
        referenceType: e.referenceType ?? undefined,
        referenceId: e.referenceId ?? undefined,
        occurredAt: e.occurredAt.toISOString(),
      })),
    };
  }

  async reserve(_dto: StockReservationDto): Promise<void> {
    return notImplemented("InventoryService.reserve");
  }

  async release(_dto: StockReleaseDto): Promise<void> {
    return notImplemented("InventoryService.release");
  }

  async adjust(dto: StockAdjustmentDto & { adjustedBy: string }): Promise<void> {
    await this.repository.recordMovement({
      productId: dto.productId,
      movementType: InventoryMovementType.ADJUSTMENT,
      quantity: dto.quantityDelta,
      notes: dto.reason,
      occurredAt: new Date(),
    });
    await prisma.auditLog.create({
      data: {
        userId: dto.adjustedBy || null,
        eventType: "INVENTORY_CHANGED",
        entityType: "Product",
        entityId: dto.productId,
        summary: `Stock adjustment ${dto.quantityDelta > 0 ? "+" : ""}${dto.quantityDelta} — ${dto.reason}`,
        occurredAt: new Date(),
      },
    });
  }
}
