import { Router } from "express";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { UsersController } from "./controller.js";
import { createUserSchema, updateUserSchema } from "./validation.js";

const controller = new UsersController();

export const usersRoutes = Router();

usersRoutes.get("/", asyncHandler(controller.list));
usersRoutes.post("/", validateBody(createUserSchema), asyncHandler(controller.create));
usersRoutes.patch("/:id", validateBody(updateUserSchema), asyncHandler(controller.update));
