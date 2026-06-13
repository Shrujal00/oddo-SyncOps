import { Router } from "express";
import { requireRoles } from "../../common/guards/rbac.guard.js";
import { authenticateRequest } from "../../common/middleware/auth.middleware.js";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { SalesController } from "./controller.js";
import {
  cancelSalesOrderSchema,
  confirmSalesOrderSchema,
  createSalesOrderSchema,
  deliverSalesOrderSchema,
  updateSalesOrderSchema,
} from "./validation.js";

const controller = new SalesController();

export const salesRoutes = Router();

salesRoutes.use(authenticateRequest);
salesRoutes.use(requireRoles("ADMIN", "SALES_USER", "BUSINESS_OWNER"));

salesRoutes.get("/", asyncHandler(controller.list));
salesRoutes.post("/", validateBody(createSalesOrderSchema), asyncHandler(controller.create));
salesRoutes.patch("/:id", validateBody(updateSalesOrderSchema), asyncHandler(controller.update));
salesRoutes.post("/:id/confirm", validateBody(confirmSalesOrderSchema), asyncHandler(controller.confirm));
salesRoutes.post("/:id/deliver", validateBody(deliverSalesOrderSchema), asyncHandler(controller.deliver));
salesRoutes.post("/:id/cancel", validateBody(cancelSalesOrderSchema), asyncHandler(controller.cancel));
