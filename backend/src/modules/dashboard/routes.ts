import { Router } from "express";
import { requireRoles } from "../../common/guards/rbac.guard.js";
import { authenticateRequest } from "../../common/middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { DashboardController } from "./controller.js";

const controller = new DashboardController();

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticateRequest);
dashboardRoutes.use(requireRoles("ADMIN", "BUSINESS_OWNER"));

dashboardRoutes.get("/", asyncHandler(controller.summary));
dashboardRoutes.get("/summary", asyncHandler(controller.summary));
