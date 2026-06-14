import type { CreateVendorDto, VendorListResponseDto, VendorResponseDto, UpdateVendorDto } from "./dto.js";
import { VendorsRepository } from "./repository.js";

function toDto(v: { id: string; name: string; email: string | null; phone: string | null; createdAt: Date; preferredByProducts?: { id: string; name: string; sku: string }[] }): VendorResponseDto {
  return {
    id: v.id,
    name: v.name,
    email: v.email ?? undefined,
    phone: v.phone ?? undefined,
    createdAt: v.createdAt.toISOString(),
    products: v.preferredByProducts ?? [],
  };
}

export class VendorsService {
  constructor(private readonly repository = new VendorsRepository()) {}

  async list(name?: string, page = 1, limit = 20): Promise<VendorListResponseDto> {
    const { vendors, total } = await this.repository.list(name, page, limit);
    return { vendors: vendors.map(toDto), total, page, limit };
  }

  async getOne(id: string): Promise<VendorResponseDto> {
    return toDto(await this.repository.getById(id));
  }

  async create(dto: CreateVendorDto): Promise<VendorResponseDto> {
    return toDto(await this.repository.create(dto));
  }

  async update(id: string, dto: UpdateVendorDto): Promise<VendorResponseDto> {
    return toDto(await this.repository.update(id, dto));
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.repository.softDelete(id);
    return { id };
  }
}
