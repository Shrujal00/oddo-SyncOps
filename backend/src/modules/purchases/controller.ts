import type { Request, Response } from "express";
import { PurchasesService } from "./service.js";

export class PurchasesController {
  constructor(private readonly service = new PurchasesService()) {}

  list = async (_request: Request, response: Response) => {
    const result = await this.service.list();
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

  receive = async (request: Request, response: Response) => {
    const result = await this.service.receive(request.params["id"] as string, request.body);
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
