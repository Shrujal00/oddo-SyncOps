import { z } from "zod";

const referenceSchema = {
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  referenceType: z.enum(["SALES_ORDER", "MANUFACTURING_ORDER"]),
  referenceId: z.string().uuid(),
};

export const stockReservationSchema = z.object({
  ...referenceSchema,
  reservedBy: z.string().uuid(),
});

export const stockReleaseSchema = z.object({
  ...referenceSchema,
  releasedBy: z.string().uuid(),
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  quantityDelta: z.number().int(),
  reason: z.string().min(1),
});
