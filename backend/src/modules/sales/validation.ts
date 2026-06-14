import { z } from "zod";

const salesOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

export const createSalesOrderSchema = z.object({
  customerId: z.string().uuid(),
  orderDate: z.string().datetime(),
  requestedDate: z.string().datetime().optional(),
  items: z.array(salesOrderItemSchema).min(1),
  notes: z.string().optional(),
});

export const updateSalesOrderSchema = createSalesOrderSchema.partial();

export const confirmSalesOrderSchema = z.object({
  confirmedBy: z.string().uuid(),
});

export const deliverSalesOrderSchema = z.object({
  deliveredBy: z.string().uuid(),
  deliveredItems: z.array(
    z.object({
      salesOrderItemId: z.string().uuid(),
      quantity: z.number().int().positive(),
    }),
  ).min(1, "At least one item must be delivered"),
});

export const cancelSalesOrderSchema = z.object({
  cancelledBy: z.string().uuid(),
  reason: z.string().min(1),
});
