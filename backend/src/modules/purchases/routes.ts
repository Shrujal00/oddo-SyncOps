import { Router } from "express";
import { requireRoles } from "../../common/guards/rbac.guard.js";
import { authenticateRequest } from "../../common/middleware/auth.middleware.js";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { PurchasesController } from "./controller.js";
import {
  cancelPurchaseOrderSchema,
  confirmPurchaseOrderSchema,
  createPurchaseOrderSchema,
  receivePurchaseOrderSchema,
  updatePurchaseOrderSchema,
} from "./validation.js";

const controller = new PurchasesController();

export const purchasesRoutes = Router();

purchasesRoutes.use(authenticateRequest);
purchasesRoutes.use(requireRoles("ADMIN", "PURCHASE_USER", "BUSINESS_OWNER"));

purchasesRoutes.get("/", asyncHandler(controller.list));
purchasesRoutes.post("/", validateBody(createPurchaseOrderSchema), asyncHandler(controller.create));
purchasesRoutes.patch("/:id", validateBody(updatePurchaseOrderSchema), asyncHandler(controller.update));
purchasesRoutes.post("/:id/confirm", validateBody(confirmPurchaseOrderSchema), asyncHandler(controller.confirm));
purchasesRoutes.post("/:id/receive", validateBody(receivePurchaseOrderSchema), asyncHandler(controller.receive));
purchasesRoutes.post("/:id/cancel", validateBody(cancelPurchaseOrderSchema), asyncHandler(controller.cancel));
