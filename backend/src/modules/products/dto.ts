export type ProcurementMode = "MTS" | "MTO";
export type ProcurementSupplyStrategy = "BUY" | "MAKE";

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  unitOfMeasure: string;
  standardCost: number;
  sellingPrice: number;
  reorderPoint: number;
  procureOnDemand?: boolean;
  procurementMode?: ProcurementMode;
  supplyStrategy?: ProcurementSupplyStrategy;
  preferredVendorId?: string;
  activeBomId?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductResponseDto extends CreateProductDto {
  id: string;
  onHandQty: number;
  reservedQty: number;
  freeToUseQty: number;
}

export interface ProductListResponseDto {
  products: ProductResponseDto[];
  total: number;
}
