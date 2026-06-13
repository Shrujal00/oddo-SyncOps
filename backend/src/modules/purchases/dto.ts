export type PurchaseOrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED";

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

export interface UpdatePurchaseOrderDto {
  expectedDate?: string;
  items?: PurchaseOrderItemDto[];
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
  vendor?: { id: string; name: string };
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDate?: string;
  notes?: string;
  items: Array<PurchaseOrderItemDto & {
    id: string;
    receivedQty: number;
    product?: { id: string; sku: string; name: string };
  }>;
  totalValue: number;
}

export interface PurchaseOrderListResponseDto {
  purchaseOrders: PurchaseOrderResponseDto[];
}
