export type InventoryMovementType = "SALE" | "PURCHASE" | "CONSUMPTION" | "PRODUCTION" | "ADJUSTMENT";

export interface StockReservationDto {
  productId: string;
  quantity: number;
  referenceType: "SALES_ORDER" | "MANUFACTURING_ORDER";
  referenceId: string;
  reservedBy: string;
}

export interface StockReleaseDto {
  productId: string;
  quantity: number;
  referenceType: "SALES_ORDER" | "MANUFACTURING_ORDER";
  referenceId: string;
  releasedBy: string;
}

export interface StockAdjustmentDto {
  productId: string;
  quantityDelta: number;
  reason: string;
}

export interface InventoryLedgerEntryDto {
  productId: string;
  movementType: InventoryMovementType;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  occurredAt: string;
}

export interface InventoryLedgerResponseDto {
  entries: InventoryLedgerEntryDto[];
}
