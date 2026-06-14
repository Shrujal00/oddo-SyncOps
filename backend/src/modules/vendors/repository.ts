import { prisma } from "../../database/prisma.js";
import { HttpError } from "../../common/exceptions/http-error.js";
import type { CreateVendorDto, UpdateVendorDto } from "./dto.js";

const PRODUCT_SELECT = { id: true, name: true, sku: true } as const;

export class VendorsRepository {
  async list(name?: string, page = 1, limit = 20) {
    const where = {
      deletedAt: null,
      ...(name && { name: { contains: name, mode: "insensitive" as const } }),
    };
    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: { preferredByProducts: { where: { deletedAt: null }, select: PRODUCT_SELECT } },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vendor.count({ where }),
    ]);
    return { vendors, total };
  }

  async getById(id: string) {
    const vendor = await prisma.vendor.findFirst({
      where: { id, deletedAt: null },
      include: {
        preferredByProducts: { where: { deletedAt: null }, select: PRODUCT_SELECT },
      },
    });
    if (!vendor) throw new HttpError(404, "Vendor not found");
    return vendor;
  }

  async create(dto: CreateVendorDto) {
    const vendor = await prisma.vendor.create({
      data: { name: dto.name, email: dto.email, phone: dto.phone },
    });
    if (dto.productIds?.length) {
      await prisma.product.updateMany({
        where: { id: { in: dto.productIds }, deletedAt: null },
        data: { preferredVendorId: vendor.id },
      });
    }
    return prisma.vendor.findFirstOrThrow({
      where: { id: vendor.id },
      include: {
        preferredByProducts: { where: { deletedAt: null }, select: PRODUCT_SELECT },
      },
    });
  }

  async update(id: string, dto: UpdateVendorDto) {
    await this.getById(id);
    if (dto.productIds !== undefined) {
      await prisma.product.updateMany({
        where: { preferredVendorId: id, deletedAt: null },
        data: { preferredVendorId: null },
      });
      if (dto.productIds.length > 0) {
        await prisma.product.updateMany({
          where: { id: { in: dto.productIds }, deletedAt: null },
          data: { preferredVendorId: id },
        });
      }
    }
    return prisma.vendor.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
      include: {
        preferredByProducts: { where: { deletedAt: null }, select: PRODUCT_SELECT },
      },
    });
  }

  async softDelete(id: string) {
    await this.getById(id);
    return prisma.vendor.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
