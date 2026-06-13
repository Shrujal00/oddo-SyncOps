import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { DashboardController } from "./controller.js";

const controller = new DashboardController();

export const dashboardRoutes = Router();

dashboardRoutes.get("/summary", asyncHandler(controller.summary));
