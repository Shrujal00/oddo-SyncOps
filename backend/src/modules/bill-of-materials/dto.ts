export interface BillOfMaterialItemDto {
  componentProductId: string;
  quantity: number;
  scrapPercentage?: number;
}

export interface CreateBillOfMaterialDto {
  productId: string;
  name: string;
  version: string;
  items: BillOfMaterialItemDto[];
}

export interface BillOfMaterialResponseDto extends CreateBillOfMaterialDto {
  id: string;
  isActive: boolean;
}
