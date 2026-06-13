import { Router } from "express";
import { requireRoles } from "../../common/guards/rbac.guard.js";
import { authenticateRequest } from "../../common/middleware/auth.middleware.js";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { UsersController } from "./controller.js";
import { createUserSchema, updateRoleSchema, updateUserSchema } from "./validation.js";

const controller = new UsersController();

export const usersRoutes = Router();

usersRoutes.use(authenticateRequest);
usersRoutes.use(requireRoles("ADMIN"));

usersRoutes.get("/", asyncHandler(controller.list));
usersRoutes.get("/roles", asyncHandler(controller.roles));
usersRoutes.patch("/roles/:roleName", validateBody(updateRoleSchema), asyncHandler(controller.updateRole));
usersRoutes.post("/", validateBody(createUserSchema), asyncHandler(controller.create));
usersRoutes.patch("/:id", validateBody(updateUserSchema), asyncHandler(controller.update));
usersRoutes.post("/:id/activate", asyncHandler(controller.activate));
usersRoutes.post("/:id/deactivate", asyncHandler(controller.deactivate));
usersRoutes.delete("/:id", asyncHandler(controller.remove));
