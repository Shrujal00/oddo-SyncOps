import type { Request, Response } from "express";
import { SalesService } from "./service.js";

export class SalesController {
  constructor(private readonly service = new SalesService()) {}

  list = async (request: Request, response: Response) => {
    const { page, limit, status } = request.query as Record<string, string>;
    const result = await this.service.list(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
      status as any,
    );
    response.json({ data: result });
  };

  create = async (request: Request, response: Response) => {
    const result = await this.service.create(request.body);
    response.status(201).json({ data: result });
  };

  update = async (request: Request, response: Response) => {
    const result = await this.service.update(request.params["id"] as string, request.body);
    response.json({ data: result });
  };

  confirm = async (request: Request, response: Response) => {
    const result = await this.service.confirm(request.params["id"] as string, request.body);
    response.json({ data: result });
  };

  deliver = async (request: Request, response: Response) => {
    const result = await this.service.deliver(request.params["id"] as string, request.body);
    response.json({ data: result });
  };

  cancel = async (request: Request, response: Response) => {
    const result = await this.service.cancel(request.params["id"] as string, request.body);
    response.json({ data: result });
  };

  remove = async (request: Request, response: Response) => {
    const result = await this.service.remove(request.params["id"] as string);
    response.json({ data: result });
  };
}
