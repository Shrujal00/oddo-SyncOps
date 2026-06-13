export type SalesOrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PARTIALLY_DELIVERED"
  | "DELIVERED"
  | "CANCELLED";

export interface SalesOrderItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalesOrderDto {
  customerId: string;
  orderDate: string;
  requestedDate?: string;
  items: SalesOrderItemDto[];
  notes?: string;
}

export interface UpdateSalesOrderDto {
  requestedDate?: string;
  items?: SalesOrderItemDto[];
  notes?: string;
}

export interface ConfirmSalesOrderDto {
  confirmedBy: string;
}

export interface DeliverSalesOrderDto {
  deliveredBy: string;
  deliveredItems: Array<{
    salesOrderItemId: string;
    quantity: number;
  }>;
}

export interface CancelSalesOrderDto {
  cancelledBy: string;
  reason: string;
}

export interface SalesOrderResponseDto {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: { id: string; name: string };
  status: SalesOrderStatus;
  orderDate: string;
  requestedDate?: string;
  notes?: string;
  items: Array<SalesOrderItemDto & {
    id: string;
    deliveredQty: number;
    product?: { id: string; sku: string; name: string };
  }>;
  totalValue: number;
}

export interface SalesOrderListResponseDto {
  salesOrders: SalesOrderResponseDto[];
}
