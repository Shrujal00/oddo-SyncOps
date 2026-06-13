import { Router } from "express";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ManufacturingController } from "./controller.js";
import {
  completeManufacturingSchema,
  confirmManufacturingSchema,
  createManufacturingOrderSchema,
  createWorkCenterSchema,
  startManufacturingSchema,
  updateWorkCenterSchema,
  updateWorkOrderSchema,
} from "./validation.js";

const controller = new ManufacturingController();

export const manufacturingRoutes = Router();

manufacturingRoutes.get("/work-centers", asyncHandler(controller.listWorkCenters));
manufacturingRoutes.post("/work-centers", validateBody(createWorkCenterSchema), asyncHandler(controller.createWorkCenter));
manufacturingRoutes.patch("/work-centers/:id", validateBody(updateWorkCenterSchema), asyncHandler(controller.updateWorkCenter));
manufacturingRoutes.get("/", asyncHandler(controller.list));
manufacturingRoutes.post("/", validateBody(createManufacturingOrderSchema), asyncHandler(controller.create));
manufacturingRoutes.post("/:id/confirm", validateBody(confirmManufacturingSchema), asyncHandler(controller.confirm));
manufacturingRoutes.post("/:id/start", validateBody(startManufacturingSchema), asyncHandler(controller.start));
manufacturingRoutes.post("/:id/complete", validateBody(completeManufacturingSchema), asyncHandler(controller.complete));
manufacturingRoutes.patch("/:moId/work-orders/:woId", validateBody(updateWorkOrderSchema), asyncHandler(controller.updateWorkOrder));
