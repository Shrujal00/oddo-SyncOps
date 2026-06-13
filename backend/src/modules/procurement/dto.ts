export type ProcurementMode = "MTS" | "MTO";
export type ProcurementSupplyAction = "RESERVE_STOCK" | "CREATE_PURCHASE_ORDER" | "CREATE_MANUFACTURING_ORDER";

export interface ProcurementDemandDto {
  productId: string;
  requiredQuantity: number;
  requiredDate?: string;
  mode: ProcurementMode;
  sourceDocumentType?: "SALES_ORDER" | "FORECAST" | "MANUAL";
  sourceDocumentId?: string;
}

export interface ProcurementRuleEvaluationDto {
  demand: ProcurementDemandDto;
  availableQuantity: number;
  shortageQuantity: number;
  recommendedAction: ProcurementSupplyAction;
}

export interface ProcurementPlanResponseDto {
  evaluations: ProcurementRuleEvaluationDto[];
}

export interface ProcurementTriggerDemandDto {
  salesOrderId: string;
  productId: string;
  requiredQty: number;
  availableQty: number;
}

export interface ProcurementActionResponseDto {
  id: string;
  salesOrderId?: string;
  productId?: string;
  actionType?: "CREATE_PURCHASE_ORDER" | "CREATE_MANUFACTURING_ORDER";
  createdEntityType?: "PurchaseOrder" | "ManufacturingOrder";
  createdEntityId?: string;
  summary: string;
  occurredAt: string;
}
