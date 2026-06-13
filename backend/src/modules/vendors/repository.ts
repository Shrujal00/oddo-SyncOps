import { prisma } from "../../database/prisma.js";
import { HttpError } from "../../common/exceptions/http-error.js";
import type { CreateVendorDto, UpdateVendorDto } from "./dto.js";

export class VendorsRepository {
  async list(name?: string) {
    return prisma.vendor.findMany({
      where: {
        deletedAt: null,
        ...(name && { name: { contains: name, mode: "insensitive" as const } }),
      },
      orderBy: { name: "asc" },
    });
  }

  async getById(id: string) {
    const vendor = await prisma.vendor.findFirst({ where: { id, deletedAt: null } });
    if (!vendor) throw new HttpError(404, "Vendor not found");
    return vendor;
  }

  async create(dto: CreateVendorDto) {
    return prisma.vendor.create({
      data: { name: dto.name, email: dto.email, phone: dto.phone },
    });
  }

  async update(id: string, dto: UpdateVendorDto) {
    await this.getById(id);
    return prisma.vendor.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
    });
  }
}
