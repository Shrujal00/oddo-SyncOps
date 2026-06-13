import { Router } from "express";
import { requireRoles } from "../../common/guards/rbac.guard.js";
import { authenticateRequest } from "../../common/middleware/auth.middleware.js";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ProcurementController } from "./controller.js";
import { procurementDemandSchema } from "./validation.js";

const controller = new ProcurementController();

export const procurementRoutes = Router();

procurementRoutes.use(authenticateRequest);
procurementRoutes.use(requireRoles("ADMIN", "PURCHASE_USER", "MANUFACTURING_USER", "BUSINESS_OWNER"));

procurementRoutes.get("/", asyncHandler(controller.listActions));
procurementRoutes.get("/rules", asyncHandler(controller.listRules));
procurementRoutes.post("/plan", validateBody(procurementDemandSchema), asyncHandler(controller.plan));
