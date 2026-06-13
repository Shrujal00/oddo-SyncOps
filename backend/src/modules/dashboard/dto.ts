export interface DashboardSummaryDto {
  salesOrders: {
    total: number;
    byStatus: Record<string, number>;
    pendingDeliveries: number;
  };
  purchaseOrders: {
    total: number;
    byStatus: Record<string, number>;
    partialReceipts: number;
  };
  manufacturingOrders: {
    total: number;
    byStatus: Record<string, number>;
    inProgress: number;
  };
  lowStockProducts: Array<{
    id: string;
    sku: string;
    name: string;
    freeToUseQty: number;
    reorderPoint: number;
  }>;
}
