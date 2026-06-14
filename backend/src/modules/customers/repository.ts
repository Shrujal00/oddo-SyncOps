import { prisma } from "../../database/prisma.js";
import { HttpError } from "../../common/exceptions/http-error.js";
import type { CreateCustomerDto, UpdateCustomerDto } from "./dto.js";

export class CustomersRepository {
  async list(name?: string) {
    return prisma.customer.findMany({
      where: {
        deletedAt: null,
        ...(name && { name: { contains: name, mode: "insensitive" as const } }),
      },
      orderBy: { name: "asc" },
    });
  }

  async getById(id: string) {
    const customer = await prisma.customer.findFirst({ where: { id, deletedAt: null } });
    if (!customer) throw new HttpError(404, "Customer not found");
    return customer;
  }

  async create(dto: CreateCustomerDto) {
    return prisma.customer.create({
      data: { name: dto.name, email: dto.email, phone: dto.phone },
    });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.getById(id);
    return prisma.customer.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
    });
  }

  async softDelete(id: string) {
    await this.getById(id);
    return prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
