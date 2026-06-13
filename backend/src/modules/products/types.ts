export interface ProductFilters {
  sku?: string;
  name?: string;
  productType?: "RAW_MATERIAL" | "FINISHED_PRODUCT";
  lowStockOnly?: boolean;
}
