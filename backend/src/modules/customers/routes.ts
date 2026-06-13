import { Router } from "express";
import { authenticateRequest } from "../../common/middleware/auth.middleware.js";
import { requireRoles } from "../../common/guards/rbac.guard.js";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { CustomersController } from "./controller.js";
import { createCustomerSchema, updateCustomerSchema } from "./validation.js";

const controller = new CustomersController();

export const customersRoutes = Router();

customersRoutes.use(authenticateRequest);

customersRoutes.get("/", asyncHandler(controller.list));
customersRoutes.get("/:id", asyncHandler(controller.get));
customersRoutes.post(
  "/",
  requireRoles("ADMIN", "SALES_USER", "BUSINESS_OWNER"),
  validateBody(createCustomerSchema),
  asyncHandler(controller.create),
);
customersRoutes.patch(
  "/:id",
  requireRoles("ADMIN", "SALES_USER", "BUSINESS_OWNER"),
  validateBody(updateCustomerSchema),
  asyncHandler(controller.update),
);
