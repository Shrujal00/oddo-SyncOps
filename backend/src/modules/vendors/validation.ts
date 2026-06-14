import { z } from "zod";

export const createVendorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  productIds: z.array(z.string().uuid()).optional(),
});

export const updateVendorSchema = createVendorSchema.partial();
