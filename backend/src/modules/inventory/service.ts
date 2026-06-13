import { notImplemented } from "../../common/exceptions/not-implemented.js";
import type {
  InventoryLedgerResponseDto,
  StockAdjustmentDto,
  StockReleaseDto,
  StockReservationDto,
} from "./dto.js";
import { InventoryRepository } from "./repository.js";

export class InventoryService {
  constructor(private readonly repository = new InventoryRepository()) {}

  async ledger(): Promise<InventoryLedgerResponseDto> {
    this.repository.listLedgerEntries();
  }

  async reserve(_dto: StockReservationDto): Promise<void> {
    return notImplemented("InventoryService.reserve");
  }

  async release(_dto: StockReleaseDto): Promise<void> {
    return notImplemented("InventoryService.release");
  }

  async adjust(_dto: StockAdjustmentDto): Promise<void> {
    return notImplemented("InventoryService.adjust");
  }
}
