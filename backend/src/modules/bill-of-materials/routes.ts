import { Router } from "express";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { BillOfMaterialsController } from "./controller.js";
import { createBillOfMaterialSchema } from "./validation.js";

const controller = new BillOfMaterialsController();

export const billOfMaterialsRoutes = Router();

billOfMaterialsRoutes.get("/", asyncHandler(controller.list));
billOfMaterialsRoutes.post("/", validateBody(createBillOfMaterialSchema), asyncHandler(controller.create));
