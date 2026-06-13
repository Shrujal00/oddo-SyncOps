import type { CreateCustomerDto, CustomerListResponseDto, CustomerResponseDto, UpdateCustomerDto } from "./dto.js";
import { CustomersRepository } from "./repository.js";

function toDto(c: { id: string; name: string; email: string | null; phone: string | null; createdAt: Date }): CustomerResponseDto {
  return {
    id: c.id,
    name: c.name,
    email: c.email ?? undefined,
    phone: c.phone ?? undefined,
    createdAt: c.createdAt.toISOString(),
  };
}

export class CustomersService {
  constructor(private readonly repository = new CustomersRepository()) {}

  async list(name?: string): Promise<CustomerListResponseDto> {
    const customers = await this.repository.list(name);
    return { customers: customers.map(toDto), total: customers.length };
  }

  async getOne(id: string): Promise<CustomerResponseDto> {
    return toDto(await this.repository.getById(id));
  }

  async create(dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    return toDto(await this.repository.create(dto));
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<CustomerResponseDto> {
    return toDto(await this.repository.update(id, dto));
  }
}
