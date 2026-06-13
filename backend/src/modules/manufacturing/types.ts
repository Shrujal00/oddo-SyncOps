import type { ManufacturingStatus } from "./dto.js";

export interface ManufacturingStateTransition {
  from: ManufacturingStatus;
  to: ManufacturingStatus;
  event: "confirm" | "start" | "complete";
}
