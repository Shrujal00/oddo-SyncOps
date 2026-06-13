export type SalesOrderStatus =
  | "Draft"
  | "Confirmed"
  | "PartiallyDelivered"
  | "Delivered"
  | "Cancelled";

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
  status: SalesOrderStatus;
  items: SalesOrderItemDto[];
}

export interface SalesOrderListResponseDto {
  salesOrders: SalesOrderResponseDto[];
}
