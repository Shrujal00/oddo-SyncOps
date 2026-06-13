import { Router } from "express";
import { requireRoles } from "../../common/guards/rbac.guard.js";
import { authenticateRequest } from "../../common/middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AuditController } from "./controller.js";

const controller = new AuditController();

export const auditRoutes = Router();

auditRoutes.use(authenticateRequest);
auditRoutes.use(requireRoles("ADMIN", "BUSINESS_OWNER"));
auditRoutes.get("/", asyncHandler(controller.list));
