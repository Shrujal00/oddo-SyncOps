import { z } from "zod";

const purchaseOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitCost: z.number().nonnegative(),
});

export const createPurchaseOrderSchema = z.object({
  vendorId: z.string().uuid(),
  orderDate: z.string().datetime(),
  expectedDate: z.string().datetime().optional(),
  items: z.array(purchaseOrderItemSchema).min(1),
  notes: z.string().optional(),
});

export const updatePurchaseOrderSchema = createPurchaseOrderSchema
  .pick({ expectedDate: true, items: true, notes: true })
  .partial();

export const confirmPurchaseOrderSchema = z.object({
  confirmedBy: z.string().uuid(),
});

export const receivePurchaseOrderSchema = z.object({
  receivedBy: z.string().uuid(),
  receivedItems: z.array(
    z.object({
      purchaseOrderItemId: z.string().uuid(),
      quantity: z.number().int().positive(),
    }),
  ),
});

export const cancelPurchaseOrderSchema = z.object({
  cancelledBy: z.string().uuid(),
  reason: z.string().min(1),
});
