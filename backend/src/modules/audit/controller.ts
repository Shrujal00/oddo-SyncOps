import type { Response } from "express";
import type { AuthenticatedRequest } from "../../common/middleware/auth.middleware.js";
import type { AuditEventType } from "./dto.js";
import { AuditService } from "./service.js";

export class AuditController {
  constructor(private readonly service = new AuditService()) {}

  list = async (request: AuthenticatedRequest, response: Response) => {
    const { entityType, entityId, eventType, userId, from, to, page, limit } = request.query as Record<string, string>;
    const result = await this.service.list({
      entityType,
      entityId,
      eventType: eventType as AuditEventType | undefined,
      userId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    }, request.user);
    response.json({ data: result });
  };

  record = async (request: AuthenticatedRequest, response: Response) => {
    await this.service.record(request.body);
    response.status(202).json({ data: null });
  };
}
