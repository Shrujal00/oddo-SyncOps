import { notImplemented } from "../../common/exceptions/not-implemented.js";
import type { ProcurementDemandDto, ProcurementPlanResponseDto } from "./dto.js";
import { ProcurementRepository } from "./repository.js";

export class ProcurementService {
  constructor(private readonly repository = new ProcurementRepository()) {}

  async listRules() {
    this.repository.listRules();
  }

  async plan(_dto: ProcurementDemandDto): Promise<ProcurementPlanResponseDto> {
    return notImplemented("ProcurementService.plan");
  }
}
