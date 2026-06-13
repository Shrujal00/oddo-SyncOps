import type { ProcurementMode, ProcurementSupplyStrategy } from "../products/dto.js";

export type { ProcurementMode, ProcurementSupplyStrategy };

export interface ProcurementRule {
  productId: string;
  mode: ProcurementMode;
  supplyStrategy: ProcurementSupplyStrategy;
  preferredVendorId?: string;
  activeBomId?: string;
}

export interface ProcurementDemand {
  salesOrderId: string;
  productId: string;
  requiredQty: number;
  availableQty: number;
  shortfallQty: number;
}

export interface ProcurementPlanner {
  evaluateDemand: (demand: ProcurementDemand) => Promise<void>;
}
