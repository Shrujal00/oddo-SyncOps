import type { Request, Response } from "express";
import { ProductsService } from "./service.js";

export class ProductsController {
  constructor(private readonly service = new ProductsService()) {}

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
}
