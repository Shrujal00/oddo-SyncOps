import type { DashboardSummaryDto } from "./dto.js";
import { DashboardRepository } from "./repository.js";
import { InventoryRepository } from "../inventory/repository.js";

function groupRowsToRecord(rows: Array<{ status: string; _count: { _all: number } }>) {
  return Object.fromEntries(rows.map((row) => [row.status, row._count._all]));
}

export class DashboardService {
  constructor(
    private readonly repository = new DashboardRepository(),
    private readonly inventoryRepo = new InventoryRepository(),
  ) {}

  async summary(): Promise<DashboardSummaryDto> {
    const inputs = await this.repository.loadSummaryInputs();
    const productsWithStock = await Promise.all(
      inputs.products.map(async (product) => {
        const stock = await this.inventoryRepo.getStockSummary(product.id);
        return { ...product, freeToUseQty: stock.freeToUseQty };
      }),
    );

    return {
      salesOrders: {
        total: inputs.salesTotal,
        byStatus: groupRowsToRecord(inputs.salesByStatus),
        pendingDeliveries: inputs.pendingDeliveries,
      },
      purchaseOrders: {
        total: inputs.purchaseTotal,
        byStatus: groupRowsToRecord(inputs.purchaseByStatus),
        partialReceipts: inputs.partialReceipts,
      },
      manufacturingOrders: {
        total: inputs.manufacturingTotal,
        byStatus: groupRowsToRecord(inputs.manufacturingByStatus),
        inProgress: inputs.inProgress,
      },
      lowStockProducts: productsWithStock.filter((product) => product.freeToUseQty < product.reorderPoint),
    };
  }
}
