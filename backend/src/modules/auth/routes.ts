import { Router } from "express";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AuthController } from "./controller.js";
import { forgotPasswordSchema, loginSchema } from "./validation.js";

const controller = new AuthController();

export const authRoutes = Router();

authRoutes.post("/login", validateBody(loginSchema), asyncHandler(controller.login));
authRoutes.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  asyncHandler(controller.forgotPassword),
);
