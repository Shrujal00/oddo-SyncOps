import type { CreateVendorDto, VendorListResponseDto, VendorResponseDto, UpdateVendorDto } from "./dto.js";
import { VendorsRepository } from "./repository.js";

function toDto(v: { id: string; name: string; email: string | null; phone: string | null; createdAt: Date }): VendorResponseDto {
  return {
    id: v.id,
    name: v.name,
    email: v.email ?? undefined,
    phone: v.phone ?? undefined,
    createdAt: v.createdAt.toISOString(),
  };
}

export class VendorsService {
  constructor(private readonly repository = new VendorsRepository()) {}

  async list(name?: string): Promise<VendorListResponseDto> {
    const vendors = await this.repository.list(name);
    return { vendors: vendors.map(toDto), total: vendors.length };
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
