import { Router } from "express";
import { requireRoles } from "../../common/guards/rbac.guard.js";
import { authenticateRequest } from "../../common/middleware/auth.middleware.js";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AssistantController } from "./controller.js";
import { assistantChatSchema } from "./validation.js";

const controller = new AssistantController();

export const assistantRoutes = Router();

assistantRoutes.use(authenticateRequest);

assistantRoutes.post("/chat", validateBody(assistantChatSchema), asyncHandler(controller.chat));
assistantRoutes.post("/reindex", requireRoles("ADMIN"), asyncHandler(controller.reindex));
