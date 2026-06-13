export type PurchaseOrderStatus =
  | "Draft"
  | "Confirmed"
  | "PartiallyReceived"
  | "Received"
  | "Cancelled";

export interface PurchaseOrderItemDto {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseOrderDto {
  vendorId: string;
  orderDate: string;
  expectedDate?: string;
  items: PurchaseOrderItemDto[];
  notes?: string;
}

export interface ConfirmPurchaseOrderDto {
  confirmedBy: string;
}

export interface ReceivePurchaseOrderDto {
  receivedBy: string;
  receivedItems: Array<{
    purchaseOrderItemId: string;
    quantity: number;
  }>;
}

export interface CancelPurchaseOrderDto {
  cancelledBy: string;
  reason: string;
}

export interface PurchaseOrderResponseDto {
  id: string;
  orderNumber: string;
  vendorId: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItemDto[];
}

export interface PurchaseOrderListResponseDto {
  purchaseOrders: PurchaseOrderResponseDto[];
}
