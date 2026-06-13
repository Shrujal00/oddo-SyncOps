import { Router } from "express";
import { authenticateRequest } from "../../common/middleware/auth.middleware.js";
import { requireRoles } from "../../common/guards/rbac.guard.js";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { InventoryController } from "./controller.js";
import { stockAdjustmentSchema, stockReleaseSchema, stockReservationSchema } from "./validation.js";

const controller = new InventoryController();

export const inventoryRoutes = Router();

inventoryRoutes.use(authenticateRequest);

inventoryRoutes.get(
  "/movements",
  requireRoles("ADMIN", "INVENTORY_MANAGER"),
  asyncHandler(controller.movements),
);
inventoryRoutes.post(
  "/adjustments",
  requireRoles("ADMIN", "INVENTORY_MANAGER"),
  validateBody(stockAdjustmentSchema),
  asyncHandler(controller.adjust),
);
inventoryRoutes.post(
  "/reservations",
  validateBody(stockReservationSchema),
  asyncHandler(controller.reserve),
);
inventoryRoutes.post(
  "/releases",
  validateBody(stockReleaseSchema),
  asyncHandler(controller.release),
);
