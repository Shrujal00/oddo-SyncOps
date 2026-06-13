import { z } from "zod";

export const createManufacturingOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  plannedStartDate: z.string().datetime().optional(),
  plannedFinishDate: z.string().datetime().optional(),
});

export const startManufacturingSchema = z.object({
  startedBy: z.string().uuid(),
  startedAt: z.string().datetime(),
});

export const completeManufacturingSchema = z.object({
  completedBy: z.string().uuid(),
  completedAt: z.string().datetime(),
  producedQuantity: z.number().int().positive(),
});
