import type { SalesOrderStatus } from "./dto.js";

export interface SalesOrderStateTransition {
  from: SalesOrderStatus;
  to: SalesOrderStatus;
  event: "confirm" | "deliver" | "cancel";
}
