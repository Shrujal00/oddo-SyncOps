export interface BillOfMaterialItemDto {
  componentProductId: string;
  quantity: number;
  scrapPercentage?: number;
}

export interface BillOfMaterialOperationDto {
  operationName: string;
  sequence: number;
  plannedDurationMins?: number;
  workCenterId?: string;
}

export interface CreateBillOfMaterialDto {
  productId: string;
  name: string;
  version: string;
  isActive?: boolean;
  items: BillOfMaterialItemDto[];
  operations?: BillOfMaterialOperationDto[];
}

export interface UpdateBillOfMaterialDto {
  name?: string;
  version?: string;
  isActive?: boolean;
  items?: BillOfMaterialItemDto[];
  operations?: BillOfMaterialOperationDto[];
}

export interface BillOfMaterialResponseDto extends CreateBillOfMaterialDto {
  id: string;
  isActive: boolean;
  items: Array<BillOfMaterialItemDto & {
    id: string;
    componentProduct?: { id: string; sku: string; name: string };
  }>;
}
