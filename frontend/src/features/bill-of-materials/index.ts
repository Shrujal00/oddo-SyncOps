export interface BillOfMaterialItem {
  componentProductId: string;
  quantity: number;
}

export interface BillOfMaterial {
  id: string;
  productId: string;
  version: string;
  items: BillOfMaterialItem[];
}
