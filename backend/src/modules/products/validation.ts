import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  productType: z.enum(["RAW_MATERIAL", "FINISHED_PRODUCT"]).optional(),
  unitOfMeasure: z.string().min(1),
  standardCost: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  reorderPoint: z.number().int().nonnegative().default(0),
  procureOnDemand: z.boolean().optional(),
  procurementMode: z.enum(["MTS", "MTO"]).optional(),
  supplyStrategy: z.enum(["BUY", "MAKE"]).optional(),
  preferredVendorId: z.string().uuid().optional(),
  activeBomId: z.string().uuid().optional(),
});

export const updateProductSchema = createProductSchema.partial();
