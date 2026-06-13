import { Router } from "express";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ProductsController } from "./controller.js";
import { createProductSchema, updateProductSchema } from "./validation.js";

const controller = new ProductsController();

export const productsRoutes = Router();

productsRoutes.get("/", asyncHandler(controller.list));
productsRoutes.post("/", validateBody(createProductSchema), asyncHandler(controller.create));
productsRoutes.patch("/:id", validateBody(updateProductSchema), asyncHandler(controller.update));
