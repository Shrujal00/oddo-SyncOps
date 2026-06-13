import type { Request, Response } from "express";
import { AuditService } from "./service.js";

export class AuditController {
  constructor(private readonly service = new AuditService()) {}

  list = async (_request: Request, response: Response) => {
    const result = await this.service.list();
    response.json({ data: result });
  };

  record = async (request: Request, response: Response) => {
    await this.service.record(request.body);
    response.status(202).json({ data: null });
  };
}
