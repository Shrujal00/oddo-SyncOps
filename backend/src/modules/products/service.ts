import type { Product } from "@prisma/client";
import type { CreateProductDto, ProductListResponseDto, ProductResponseDto, UpdateProductDto } from "./dto.js";
import { ProductsRepository, type ListProductsFilters } from "./repository.js";
import { InventoryRepository } from "../inventory/repository.js";
import { AuditRepository } from "../audit/repository.js";

function toNum(v: unknown): number {
  return Number(v ?? 0);
}

async function attachStock(
  product: Product,
  inventoryRepo: InventoryRepository,
): Promise<ProductResponseDto> {
  const stock = await inventoryRepo.getStockSummary(product.id);
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description ?? undefined,
    productType: product.productType as "RAW_MATERIAL" | "FINISHED_PRODUCT",
    unitOfMeasure: product.unitOfMeasure,
    standardCost: toNum(product.standardCost),
    sellingPrice: toNum(product.sellingPrice),
    reorderPoint: product.reorderPoint,
    procureOnDemand: product.procureOnDemand,
    procurementMode: product.procurementMode as "MTS" | "MTO",
    supplyStrategy: product.supplyStrategy as "BUY" | "MAKE",
    preferredVendorId: product.preferredVendorId ?? undefined,
    activeBomId: product.activeBomId ?? undefined,
    ...stock,
  };
}

export class ProductsService {
  constructor(
    private readonly repository = new ProductsRepository(),
    private readonly inventoryRepo = new InventoryRepository(),
    private readonly auditRepo = new AuditRepository(),
  ) {}

  async list(filters: ListProductsFilters & { lowStockOnly?: boolean } = {}): Promise<ProductListResponseDto> {
    const { lowStockOnly, ...repoFilters } = filters;
    const products = await this.repository.listProducts(repoFilters);
    const withStock = await Promise.all(products.map((p) => attachStock(p, this.inventoryRepo)));
    const result = lowStockOnly
      ? withStock.filter((p) => p.freeToUseQty < p.reorderPoint)
      : withStock;
    return { products: result, total: result.length };
  }

  async getOne(id: string): Promise<ProductResponseDto> {
    const product = await this.repository.getById(id);
    return attachStock(product, this.inventoryRepo);
  }

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.repository.create(dto);
    await this.auditRepo.record({
      eventType: "PRODUCT_UPDATED",
      entityType: "Product",
      entityId: product.id,
      summary: "Product created",
    });
    return attachStock(product, this.inventoryRepo);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.repository.update(id, dto);
    await this.auditRepo.record({
      eventType: "PRODUCT_UPDATED",
      entityType: "Product",
      entityId: product.id,
      summary: "Product updated",
    });
    return attachStock(product, this.inventoryRepo);
  }
}
