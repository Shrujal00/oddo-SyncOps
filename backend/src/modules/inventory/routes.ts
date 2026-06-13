import { Router } from "express";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { InventoryController } from "./controller.js";
import { stockAdjustmentSchema, stockReleaseSchema, stockReservationSchema } from "./validation.js";

const controller = new InventoryController();

export const inventoryRoutes = Router();

inventoryRoutes.get("/", asyncHandler(controller.ledger));
inventoryRoutes.post("/reservations", validateBody(stockReservationSchema), asyncHandler(controller.reserve));
inventoryRoutes.post("/releases", validateBody(stockReleaseSchema), asyncHandler(controller.release));
inventoryRoutes.post("/adjustments", validateBody(stockAdjustmentSchema), asyncHandler(controller.adjust));
