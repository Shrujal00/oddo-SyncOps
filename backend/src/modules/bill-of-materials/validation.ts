import { z } from "zod";

export const createBillOfMaterialSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1),
  version: z.string().min(1),
  items: z.array(
    z.object({
      componentProductId: z.string().uuid(),
      quantity: z.number().int().positive(),
      scrapPercentage: z.number().min(0).max(100).optional(),
    }),
  ),
});
