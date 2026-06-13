import { Router } from "express";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { BillOfMaterialsController } from "./controller.js";
import { createBillOfMaterialSchema, updateBillOfMaterialSchema } from "./validation.js";

const controller = new BillOfMaterialsController();

export const billOfMaterialsRoutes = Router();

billOfMaterialsRoutes.get("/", asyncHandler(controller.list));
billOfMaterialsRoutes.get("/:id", asyncHandler(controller.get));
billOfMaterialsRoutes.post("/", validateBody(createBillOfMaterialSchema), asyncHandler(controller.create));
billOfMaterialsRoutes.patch("/:id", validateBody(updateBillOfMaterialSchema), asyncHandler(controller.update));
billOfMaterialsRoutes.delete("/:id", asyncHandler(controller.remove));
