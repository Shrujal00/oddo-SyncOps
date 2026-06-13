import { HttpError } from "../../common/exceptions/http-error.js";
import type { BillOfMaterialResponseDto, CreateBillOfMaterialDto, UpdateBillOfMaterialDto } from "./dto.js";
import { BillOfMaterialsRepository, type BillOfMaterialWithRelations } from "./repository.js";

function toNum(value: unknown): number {
  return Number(value ?? 0);
}

function toDto(bom: BillOfMaterialWithRelations): BillOfMaterialResponseDto {
  return {
    id: bom.id,
    productId: bom.productId,
    name: bom.name,
    version: bom.version,
    isActive: bom.isActive,
    items: bom.items.map((item) => ({
      id: item.id,
      componentProductId: item.productId,
      componentProduct: item.product,
      quantity: item.quantity,
      scrapPercentage: item.scrapPercentage === null ? undefined : toNum(item.scrapPercentage),
    })),
    operations: [],
  };
}

export class BillOfMaterialsService {
  constructor(private readonly repository = new BillOfMaterialsRepository()) {}

  async list(productId?: string): Promise<BillOfMaterialResponseDto[]> {
    const boms = await this.repository.listBillOfMaterials(productId);
    return boms.map(toDto);
  }

  async getOne(id: string): Promise<BillOfMaterialResponseDto> {
    return toDto(await this.repository.findById(id));
  }

  async create(dto: CreateBillOfMaterialDto): Promise<BillOfMaterialResponseDto> {
    await this.validateReferences(dto);
    return toDto(await this.repository.create(dto));
  }

  async update(id: string, dto: UpdateBillOfMaterialDto): Promise<BillOfMaterialResponseDto> {
    await this.validateReferences(dto);
    return toDto(await this.repository.update(id, dto));
  }

  async remove(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  private async validateReferences(dto: Partial<CreateBillOfMaterialDto>) {
    if (dto.productId && !(await this.repository.productExists(dto.productId))) {
      throw new HttpError(400, "Product not found");
    }
    for (const item of dto.items ?? []) {
      if (!(await this.repository.productExists(item.componentProductId))) {
        throw new HttpError(400, `Component product not found: ${item.componentProductId}`);
      }
    }
    for (const operation of dto.operations ?? []) {
      if (operation.workCenterId && !(await this.repository.workCenterExists(operation.workCenterId))) {
        throw new HttpError(400, `Work center not found: ${operation.workCenterId}`);
      }
    }
  }
}
