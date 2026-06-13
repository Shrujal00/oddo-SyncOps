import type { Request, Response } from "express";
import { InventoryService } from "./service.js";

export class InventoryController {
  constructor(private readonly service = new InventoryService()) {}

  ledger = async (_request: Request, response: Response) => {
    const result = await this.service.ledger();
    response.json({ data: result });
  };

  reserve = async (request: Request, response: Response) => {
    await this.service.reserve(request.body);
    response.status(202).json({ data: null });
  };

  release = async (request: Request, response: Response) => {
    await this.service.release(request.body);
    response.status(202).json({ data: null });
  };

  adjust = async (request: Request, response: Response) => {
    await this.service.adjust(request.body);
    response.status(202).json({ data: null });
  };
}
