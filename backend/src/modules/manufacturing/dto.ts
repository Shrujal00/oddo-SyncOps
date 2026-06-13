export type ManufacturingStatus = "DRAFT" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED";
export type WorkOrderStatus = "PLANNED" | "RELEASED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface ManufacturingOperationDto {
  operationName: string;
  sequence: number;
  plannedDurationMins?: number;
  workCenterId?: string;
}

export interface CreateManufacturingOrderDto {
  productId: string;
  quantity: number;
  plannedStartDate?: string;
  plannedFinishDate?: string;
  operations?: ManufacturingOperationDto[];
  notes?: string;
}

export interface ConfirmManufacturingDto {
  confirmedBy: string;
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
  product?: { id: string; sku: string; name: string };
  quantity: number;
  status: ManufacturingStatus;
  plannedStartDate?: string;
  plannedFinishDate?: string;
  workOrders: Array<{
    id: string;
    operationName: string;
    sequence: number;
    plannedDurationMins?: number;
    workCenterId?: string;
    workCenter?: { id: string; name: string };
    status: WorkOrderStatus;
  }>;
  warnings?: string[];
}

export interface UpdateWorkOrderDto {
  status: WorkOrderStatus;
}

export interface WorkCenterDto {
  id: string;
  name: string;
  description?: string;
}

export interface CreateWorkCenterDto {
  name: string;
  description?: string;
}

export interface UpdateWorkCenterDto extends Partial<CreateWorkCenterDto> {}
