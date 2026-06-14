import type { Request, Response } from "express";
import { CustomersService } from "./service.js";

export class CustomersController {
  constructor(private readonly service = new CustomersService()) {}

  list = async (request: Request, response: Response) => {
    const { name } = request.query as Record<string, string>;
    const result = await this.service.list(name);
    response.json({ data: result });
  };

  get = async (request: Request, response: Response) => {
    const result = await this.service.getOne(request.params["id"] as string);
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

  remove = async (request: Request, response: Response) => {
    const result = await this.service.remove(request.params["id"] as string);
    response.json({ data: result });
  };
}
