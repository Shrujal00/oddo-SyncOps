import type { Request, Response } from "express";
import { DashboardService } from "./service.js";

export class DashboardController {
  constructor(private readonly service = new DashboardService()) {}

  summary = async (_request: Request, response: Response) => {
    const result = await this.service.summary();
    response.json({ data: result });
  };
}
