export type ProcurementMode = "MTS" | "MTO";
export type ProcurementSupplyStrategy = "BUY" | "MAKE";
export type ProductType = "RAW_MATERIAL" | "FINISHED_PRODUCT";

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  productType?: ProductType;
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
  productType: ProductType;
  onHandQty: number;
  reservedQty: number;
  freeToUseQty: number;
}

export interface ProductListResponseDto {
  products: ProductResponseDto[];
  total: number;
  page: number;
  limit: number;
}
