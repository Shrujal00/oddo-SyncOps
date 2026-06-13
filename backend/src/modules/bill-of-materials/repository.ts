import type { Prisma } from "@prisma/client";
import { HttpError } from "../../common/exceptions/http-error.js";
import { prisma } from "../../database/prisma.js";
import type { CreateBillOfMaterialDto, UpdateBillOfMaterialDto } from "./dto.js";

const billOfMaterialInclude = {
  product: { select: { id: true, sku: true, name: true } },
  items: {
    where: { deletedAt: null },
    include: { product: { select: { id: true, sku: true, name: true } } },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.BillOfMaterialInclude;

export type BillOfMaterialWithRelations = Prisma.BillOfMaterialGetPayload<{ include: typeof billOfMaterialInclude }>;

function itemCreateManyData(items: CreateBillOfMaterialDto["items"]) {
  return items.map((item) => ({
    productId: item.componentProductId,
    quantity: item.quantity,
    scrapPercentage: item.scrapPercentage,
  }));
}

export class BillOfMaterialsRepository {
  async listBillOfMaterials(productId?: string) {
    return prisma.billOfMaterial.findMany({
      where: {
        deletedAt: null,
        ...(productId && { productId }),
      },
      include: billOfMaterialInclude,
      orderBy: [{ productId: "asc" }, { version: "desc" }],
    });
  }

  async findById(id: string) {
    const bom = await prisma.billOfMaterial.findFirst({
      where: { id, deletedAt: null },
      include: billOfMaterialInclude,
    });
    if (!bom) throw new HttpError(404, "Bill of material not found");
    return bom;
  }

  async productExists(id: string) {
    const product = await prisma.product.findFirst({ where: { id, deletedAt: null } });
    return Boolean(product);
  }

  async workCenterExists(id: string) {
    const workCenter = await prisma.workCenter.findFirst({ where: { id, deletedAt: null } });
    return Boolean(workCenter);
  }

  async create(dto: CreateBillOfMaterialDto) {
    const isActive = dto.isActive ?? true;
    return prisma.$transaction(async (tx) => {
      if (isActive) {
        await tx.billOfMaterial.updateMany({
          where: { productId: dto.productId, deletedAt: null, isActive: true },
          data: { isActive: false },
        });
      }
      const bom = await tx.billOfMaterial.create({
        data: {
          productId: dto.productId,
          name: dto.name,
          version: dto.version,
          isActive,
          items: { createMany: { data: itemCreateManyData(dto.items) } },
        },
        include: billOfMaterialInclude,
      });
      if (isActive) {
        await tx.product.update({ where: { id: dto.productId }, data: { activeBomId: bom.id } });
      }
      return bom;
    });
  }

  async update(id: string, dto: UpdateBillOfMaterialDto) {
    const existing = await this.findById(id);
    return prisma.$transaction(async (tx) => {
      if (dto.isActive === true) {
        await tx.billOfMaterial.updateMany({
          where: { productId: existing.productId, deletedAt: null, isActive: true, id: { not: id } },
          data: { isActive: false },
        });
      }
      const bom = await tx.billOfMaterial.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.version !== undefined && { version: dto.version }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          ...(dto.items !== undefined && {
            items: {
              deleteMany: {},
              createMany: { data: itemCreateManyData(dto.items) },
            },
          }),
        },
        include: billOfMaterialInclude,
      });
      if (dto.isActive === true) {
        await tx.product.update({ where: { id: existing.productId }, data: { activeBomId: id } });
      } else if (dto.isActive === false) {
        await tx.product.updateMany({ where: { id: existing.productId, activeBomId: id }, data: { activeBomId: null } });
      }
      return bom;
    });
  }

  async softDelete(id: string) {
    const existing = await this.findById(id);
    await prisma.$transaction([
      prisma.billOfMaterial.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } }),
      prisma.product.updateMany({ where: { id: existing.productId, activeBomId: id }, data: { activeBomId: null } }),
    ]);
  }
}
