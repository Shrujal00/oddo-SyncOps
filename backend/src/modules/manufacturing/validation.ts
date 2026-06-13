import { z } from "zod";

const manufacturingOperationSchema = z.object({
  operationName: z.string().min(1),
  sequence: z.number().int().positive(),
  plannedDurationMins: z.number().int().positive().optional(),
  workCenterId: z.string().uuid().optional(),
});

export const createManufacturingOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  plannedStartDate: z.string().datetime().optional(),
  plannedFinishDate: z.string().datetime().optional(),
  operations: z.array(manufacturingOperationSchema).optional(),
  notes: z.string().optional(),
});

export const confirmManufacturingSchema = z.object({
  confirmedBy: z.string().uuid(),
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

export const updateWorkOrderSchema = z.object({
  status: z.enum(["PLANNED", "RELEASED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

export const createWorkCenterSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const updateWorkCenterSchema = createWorkCenterSchema.partial();
