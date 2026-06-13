import { Router } from "express";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { PurchasesController } from "./controller.js";
import {
  cancelPurchaseOrderSchema,
  confirmPurchaseOrderSchema,
  createPurchaseOrderSchema,
  receivePurchaseOrderSchema,
} from "./validation.js";

const controller = new PurchasesController();

export const purchasesRoutes = Router();

purchasesRoutes.get("/", asyncHandler(controller.list));
purchasesRoutes.post("/", validateBody(createPurchaseOrderSchema), asyncHandler(controller.create));
purchasesRoutes.post("/:id/confirm", validateBody(confirmPurchaseOrderSchema), asyncHandler(controller.confirm));
purchasesRoutes.post("/:id/receive", validateBody(receivePurchaseOrderSchema), asyncHandler(controller.receive));
purchasesRoutes.post("/:id/cancel", validateBody(cancelPurchaseOrderSchema), asyncHandler(controller.cancel));
