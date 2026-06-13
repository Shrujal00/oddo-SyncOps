import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  unitOfMeasure: z.string().min(1),
  standardCost: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  reorderPoint: z.number().int().nonnegative(),
});

export const updateProductSchema = createProductSchema.partial();
