import type { Request, Response } from "express";
import { ProcurementService } from "./service.js";

export class ProcurementController {
  constructor(private readonly service = new ProcurementService()) {}

  listRules = async (_request: Request, response: Response) => {
    const result = await this.service.listRules();
    response.json({ data: result });
  };

  plan = async (request: Request, response: Response) => {
    const result = await this.service.plan(request.body);
    response.status(202).json({ data: result });
  };
}
