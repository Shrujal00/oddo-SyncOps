import { Router } from "express";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AuthController } from "./controller.js";
import { forgotPasswordSchema, loginSchema, registerSchema } from "./validation.js";

const controller = new AuthController();

export const authRoutes = Router();

authRoutes.post("/login", validateBody(loginSchema), asyncHandler(controller.login));
authRoutes.post("/register", validateBody(registerSchema), asyncHandler(controller.register));
authRoutes.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  asyncHandler(controller.forgotPassword),
);
