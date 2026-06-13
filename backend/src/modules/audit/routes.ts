import { Router } from "express";
import { validateBody } from "../../common/validators/request-validator.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AuditController } from "./controller.js";
import { auditEventSchema } from "./validation.js";

const controller = new AuditController();

export const auditRoutes = Router();

auditRoutes.get("/", asyncHandler(controller.list));
auditRoutes.post("/", validateBody(auditEventSchema), asyncHandler(controller.record));
