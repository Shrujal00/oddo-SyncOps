import { prisma } from "../../database/prisma.js";
import { HttpError } from "../../common/exceptions/http-error.js";
import type { CreateProductDto, UpdateProductDto } from "./dto.js";

export interface ListProductsFilters {
  sku?: string;
  name?: string;
  productType?: "RAW_MATERIAL" | "FINISHED_PRODUCT";
}

export class ProductsRepository {
  async listProducts(filters: ListProductsFilters = {}) {
    const { sku, name, productType } = filters;
    return prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(sku && { sku: { contains: sku, mode: "insensitive" as const } }),
        ...(name && { name: { contains: name, mode: "insensitive" as const } }),
        ...(productType && { productType }),
      },
      orderBy: { name: "asc" },
    });
  }

  async getById(id: string) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    if (!product) throw new HttpError(404, "Product not found");
    return product;
  }

  async create(dto: CreateProductDto) {
    if (dto.preferredVendorId) {
      const vendor = await prisma.vendor.findFirst({
        where: { id: dto.preferredVendorId, deletedAt: null },
      });
      if (!vendor) throw new HttpError(400, "Vendor not found");
    }
    if (dto.activeBomId) {
      const bom = await prisma.billOfMaterial.findFirst({
        where: { id: dto.activeBomId, deletedAt: null },
      });
      if (!bom) throw new HttpError(400, "BOM not found");
    }
    return prisma.product.create({
      data: {
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        productType: dto.productType ?? "FINISHED_PRODUCT",
        unitOfMeasure: dto.unitOfMeasure,
        standardCost: dto.standardCost,
        sellingPrice: dto.sellingPrice,
        reorderPoint: dto.reorderPoint ?? 0,
        procureOnDemand: dto.procureOnDemand ?? false,
        procurementMode: dto.procurementMode ?? "MTS",
        supplyStrategy: dto.supplyStrategy ?? "BUY",
        preferredVendorId: dto.preferredVendorId ?? null,
        activeBomId: dto.activeBomId ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.getById(id);
    if (dto.preferredVendorId) {
      const vendor = await prisma.vendor.findFirst({
        where: { id: dto.preferredVendorId, deletedAt: null },
      });
      if (!vendor) throw new HttpError(400, "Vendor not found");
    }
    if (dto.activeBomId) {
      const bom = await prisma.billOfMaterial.findFirst({
        where: { id: dto.activeBomId, deletedAt: null },
      });
      if (!bom) throw new HttpError(400, "BOM not found");
    }
    return prisma.product.update({
      where: { id },
      data: {
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.productType !== undefined && { productType: dto.productType }),
        ...(dto.unitOfMeasure !== undefined && { unitOfMeasure: dto.unitOfMeasure }),
        ...(dto.standardCost !== undefined && { standardCost: dto.standardCost }),
        ...(dto.sellingPrice !== undefined && { sellingPrice: dto.sellingPrice }),
        ...(dto.reorderPoint !== undefined && { reorderPoint: dto.reorderPoint }),
        ...(dto.procureOnDemand !== undefined && { procureOnDemand: dto.procureOnDemand }),
        ...(dto.procurementMode !== undefined && { procurementMode: dto.procurementMode }),
        ...(dto.supplyStrategy !== undefined && { supplyStrategy: dto.supplyStrategy }),
        ...(dto.preferredVendorId !== undefined && { preferredVendorId: dto.preferredVendorId }),
        ...(dto.activeBomId !== undefined && { activeBomId: dto.activeBomId }),
      },
    });
  }
}
