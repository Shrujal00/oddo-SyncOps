export type ManufacturingStatus = "Draft" | "Confirmed" | "InProgress" | "Completed";

export interface CreateManufacturingOrderDto {
  productId: string;
  quantity: number;
  plannedStartDate?: string;
  plannedFinishDate?: string;
}

export interface StartManufacturingDto {
  startedBy: string;
  startedAt: string;
}

export interface CompleteManufacturingDto {
  completedBy: string;
  completedAt: string;
  producedQuantity: number;
}

export interface ManufacturingOrderResponseDto {
  id: string;
  orderNumber: string;
  productId: string;
  quantity: number;
  status: ManufacturingStatus;
}
