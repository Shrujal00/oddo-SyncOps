import { Router } from "express";
import { authenticateRequest } from "../../common/middleware/auth.middleware.js";
import { requireRoles } from "../../common/guards/rbac.guard.js";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ProductsController } from "./controller.js";
import { createProductSchema, updateProductSchema } from "./validation.js";

const controller = new ProductsController();

export const productsRoutes = Router();

productsRoutes.use(authenticateRequest);

productsRoutes.get("/", asyncHandler(controller.list));
productsRoutes.get("/:id", asyncHandler(controller.get));
productsRoutes.post(
  "/",
  requireRoles("ADMIN", "BUSINESS_OWNER"),
  validateBody(createProductSchema),
  asyncHandler(controller.create),
);
productsRoutes.patch(
  "/:id",
  requireRoles("ADMIN", "BUSINESS_OWNER"),
  validateBody(updateProductSchema),
  asyncHandler(controller.update),
);
productsRoutes.delete(
  "/:id",
  requireRoles("ADMIN", "BUSINESS_OWNER"),
  asyncHandler(controller.remove),
);
