import { Router } from "express";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ManufacturingController } from "./controller.js";
import {
  completeManufacturingSchema,
  createManufacturingOrderSchema,
  startManufacturingSchema,
} from "./validation.js";

const controller = new ManufacturingController();

export const manufacturingRoutes = Router();

manufacturingRoutes.get("/", asyncHandler(controller.list));
manufacturingRoutes.post("/", validateBody(createManufacturingOrderSchema), asyncHandler(controller.create));
manufacturingRoutes.post("/:id/start", validateBody(startManufacturingSchema), asyncHandler(controller.start));
manufacturingRoutes.post("/:id/complete", validateBody(completeManufacturingSchema), asyncHandler(controller.complete));
