import { z } from "zod";

const billOfMaterialOperationSchema = z.object({
  operationName: z.string().min(1),
  sequence: z.number().int().positive(),
  plannedDurationMins: z.number().int().positive().optional(),
  workCenterId: z.string().uuid().optional(),
});

export const createBillOfMaterialSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1),
  version: z.string().min(1),
  isActive: z.boolean().optional(),
  items: z.array(
    z.object({
      componentProductId: z.string().uuid(),
      quantity: z.number().int().positive(),
      scrapPercentage: z.number().min(0).max(100).optional(),
    }),
  ).min(1),
  operations: z.array(billOfMaterialOperationSchema).optional(),
});

export const updateBillOfMaterialSchema = createBillOfMaterialSchema
  .pick({ name: true, version: true, isActive: true, items: true, operations: true })
  .partial();
