import type { Request, Response } from "express";
import { BillOfMaterialsService } from "./service.js";

export class BillOfMaterialsController {
  constructor(private readonly service = new BillOfMaterialsService()) {}

  list = async (_request: Request, response: Response) => {
    const result = await this.service.list();
    response.json({ data: result });
  };

  create = async (request: Request, response: Response) => {
    const result = await this.service.create(request.body);
    response.status(201).json({ data: result });
  };
}
