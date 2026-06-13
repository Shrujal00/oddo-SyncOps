import type { Request, Response } from "express";
import { UsersService } from "./service.js";

export class UsersController {
  constructor(private readonly service = new UsersService()) {}

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
