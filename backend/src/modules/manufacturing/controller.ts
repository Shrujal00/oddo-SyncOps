import type { Request, Response } from "express";
import { ManufacturingService } from "./service.js";

export class ManufacturingController {
  constructor(private readonly service = new ManufacturingService()) {}

  list = async (_request: Request, response: Response) => {
    const result = await this.service.list();
    response.json({ data: result });
  };

  create = async (request: Request, response: Response) => {
    const result = await this.service.create(request.body);
    response.status(201).json({ data: result });
  };

  start = async (request: Request, response: Response) => {
    const result = await this.service.start(request.params.id, request.body);
    response.json({ data: result });
  };

  complete = async (request: Request, response: Response) => {
    const result = await this.service.complete(request.params.id, request.body);
    response.json({ data: result });
  };
}
