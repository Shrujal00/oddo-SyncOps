import { z } from "zod";
import { ROLE_NAMES } from "../../common/constants/rbac.js";

const roleEnumNames = [
  "ADMIN",
  "SALES_USER",
  "PURCHASE_USER",
  "MANUFACTURING_USER",
  "INVENTORY_MANAGER",
  "BUSINESS_OWNER",
] as const;

const userBodySchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(ROLE_NAMES).optional(),
  roleName: z.enum(roleEnumNames).optional(),
  password: z.string().min(8).optional(),
});

export const createUserSchema = userBodySchema.refine((value) => value.role || value.roleName, {
  message: "roleName is required",
  path: ["roleName"],
});

export const updateUserSchema = userBodySchema.partial().extend({
  isActive: z.boolean().optional(),
});

const rolePermissionSchema = z.object({
  module: z.string().min(1),
  view: z.boolean(),
  create: z.boolean(),
  edit: z.boolean(),
  delete: z.boolean(),
  approve: z.boolean(),
});

export const updateRoleSchema = z.object({
  description: z.string().optional(),
  permissions: z.array(rolePermissionSchema).optional(),
});
