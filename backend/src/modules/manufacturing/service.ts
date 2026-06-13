import { notImplemented } from "../../common/exceptions/not-implemented.js";
import type {
  CompleteManufacturingDto,
  CreateManufacturingOrderDto,
  ManufacturingOrderResponseDto,
  StartManufacturingDto,
} from "./dto.js";
import { ManufacturingRepository } from "./repository.js";

export class ManufacturingService {
  constructor(private readonly repository = new ManufacturingRepository()) {}

  async list(): Promise<ManufacturingOrderResponseDto[]> {
    this.repository.listManufacturingOrders();
  }

  async create(_dto: CreateManufacturingOrderDto): Promise<ManufacturingOrderResponseDto> {
    return notImplemented("ManufacturingService.create");
  }

  async start(_id: string, _dto: StartManufacturingDto): Promise<ManufacturingOrderResponseDto> {
    return notImplemented("ManufacturingService.start");
  }

  async complete(_id: string, _dto: CompleteManufacturingDto): Promise<ManufacturingOrderResponseDto> {
    return notImplemented("ManufacturingService.complete");
  }
}
