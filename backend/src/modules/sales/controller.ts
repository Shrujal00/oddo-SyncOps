import type { Request, Response } from "express";
import { SalesService } from "./service.js";

export class SalesController {
  constructor(private readonly service = new SalesService()) {}

  list = async (_request: Request, response: Response) => {
    const result = await this.service.list();
    response.json({ data: result });
  };

  create = async (request: Request, response: Response) => {
    const result = await this.service.create(request.body);
    response.status(201).json({ data: result });
  };

  update = async (request: Request, response: Response) => {
    const result = await this.service.update(request.params.id, request.body);
    response.json({ data: result });
  };

  confirm = async (request: Request, response: Response) => {
    const result = await this.service.confirm(request.params.id, request.body);
    response.json({ data: result });
  };

  deliver = async (request: Request, response: Response) => {
    const result = await this.service.deliver(request.params.id, request.body);
    response.json({ data: result });
  };

  cancel = async (request: Request, response: Response) => {
    const result = await this.service.cancel(request.params.id, request.body);
    response.json({ data: result });
  };
}
