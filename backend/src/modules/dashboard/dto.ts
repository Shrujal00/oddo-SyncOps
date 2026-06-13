export interface MetricCardDto {
  label: string;
  value: number;
  changePercent?: number;
}

export interface ChartPointDto {
  label: string;
  value: number;
}

export interface DashboardSummaryDto {
  totalSalesOrders: MetricCardDto;
  pendingDeliveries: MetricCardDto;
  manufacturingOrders: MetricCardDto;
  purchaseOrders: MetricCardDto;
  inventoryValue: MetricCardDto;
  lowStockProducts: MetricCardDto;
  salesTrend: ChartPointDto[];
  inventoryByCategory: ChartPointDto[];
}
