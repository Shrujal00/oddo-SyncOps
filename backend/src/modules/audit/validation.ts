import { z } from "zod";

export const auditEventSchema = z.object({
  userId: z.string().uuid().optional(),
  eventType: z.enum([
    "USER_LOGIN",
    "PRODUCT_UPDATED",
    "SALES_ORDER_CHANGED",
    "PURCHASE_ORDER_CHANGED",
    "MANUFACTURING_COMPLETED",
    "INVENTORY_CHANGED",
  ]),
  entityType: z.string().min(1),
  entityId: z.string().uuid().optional(),
  summary: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
  occurredAt: z.string().datetime(),
});
