import { notImplemented } from "../../common/exceptions/not-implemented.js";
import type { BillOfMaterialResponseDto, CreateBillOfMaterialDto } from "./dto.js";
import { BillOfMaterialsRepository } from "./repository.js";

export class BillOfMaterialsService {
  constructor(private readonly repository = new BillOfMaterialsRepository()) {}

  async list(): Promise<BillOfMaterialResponseDto[]> {
    this.repository.listBillOfMaterials();
  }

  async create(_dto: CreateBillOfMaterialDto): Promise<BillOfMaterialResponseDto> {
    return notImplemented("BillOfMaterialsService.create");
  }
}
