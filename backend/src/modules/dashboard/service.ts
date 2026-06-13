import type { DashboardSummaryDto } from "./dto.js";
import { DashboardRepository } from "./repository.js";

export class DashboardService {
  constructor(private readonly repository = new DashboardRepository()) {}

  async summary(): Promise<DashboardSummaryDto> {
    this.repository.loadSummaryInputs();
  }
}
