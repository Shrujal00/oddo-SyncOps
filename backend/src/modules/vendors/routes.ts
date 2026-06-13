import { Router } from "express";
import { authenticateRequest } from "../../common/middleware/auth.middleware.js";
import { requireRoles } from "../../common/guards/rbac.guard.js";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { VendorsController } from "./controller.js";
import { createVendorSchema, updateVendorSchema } from "./validation.js";

const controller = new VendorsController();

export const vendorsRoutes = Router();

vendorsRoutes.use(authenticateRequest);

vendorsRoutes.get("/", asyncHandler(controller.list));
vendorsRoutes.get("/:id", asyncHandler(controller.get));
vendorsRoutes.post(
  "/",
  requireRoles("ADMIN", "PURCHASE_USER", "BUSINESS_OWNER"),
  validateBody(createVendorSchema),
  asyncHandler(controller.create),
);
vendorsRoutes.patch(
  "/:id",
  requireRoles("ADMIN", "PURCHASE_USER", "BUSINESS_OWNER"),
  validateBody(updateVendorSchema),
  asyncHandler(controller.update),
);
