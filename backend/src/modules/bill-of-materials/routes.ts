import { Router } from "express";
import { requireRoles } from "../../common/guards/rbac.guard.js";
import { authenticateRequest } from "../../common/middleware/auth.middleware.js";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { BillOfMaterialsController } from "./controller.js";
import { createBillOfMaterialSchema, updateBillOfMaterialSchema } from "./validation.js";

const controller = new BillOfMaterialsController();

export const billOfMaterialsRoutes = Router();

billOfMaterialsRoutes.use(authenticateRequest);
billOfMaterialsRoutes.use(requireRoles("ADMIN", "MANUFACTURING_USER", "BUSINESS_OWNER"));

billOfMaterialsRoutes.get("/", asyncHandler(controller.list));
billOfMaterialsRoutes.get("/:id", asyncHandler(controller.get));
billOfMaterialsRoutes.post("/", validateBody(createBillOfMaterialSchema), asyncHandler(controller.create));
billOfMaterialsRoutes.patch("/:id", validateBody(updateBillOfMaterialSchema), asyncHandler(controller.update));
billOfMaterialsRoutes.delete("/:id", asyncHandler(controller.remove));
