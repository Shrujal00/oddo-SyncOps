import type { PurchaseOrderStatus } from "./dto.js";

export interface PurchaseOrderStateTransition {
  from: PurchaseOrderStatus;
  to: PurchaseOrderStatus;
  event: "confirm" | "receive" | "cancel";
}
