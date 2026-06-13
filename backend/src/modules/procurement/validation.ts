import { z } from "zod";

export const procurementDemandSchema = z.object({
  productId: z.string().uuid(),
  requiredQuantity: z.number().int().positive(),
  requiredDate: z.string().datetime().optional(),
  mode: z.enum(["MTS", "MTO"]),
  sourceDocumentType: z.enum(["SALES_ORDER", "FORECAST", "MANUAL"]).optional(),
  sourceDocumentId: z.string().uuid().optional(),
});
