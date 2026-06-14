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

  confirm = async (request: Request, response: Response) => {
    const result = await this.service.confirm(request.params["id"] as string, request.body);
    response.json({ data: result });
  };

  start = async (request: Request, response: Response) => {
    const result = await this.service.start(request.params["id"] as string, request.body);
    response.json({ data: result });
  };

  complete = async (request: Request, response: Response) => {
    const result = await this.service.complete(request.params["id"] as string, request.body);
    response.json({ data: result });
  };

  updateWorkOrder = async (request: Request, response: Response) => {
    const result = await this.service.updateWorkOrder(
      request.params["moId"] as string,
      request.params["woId"] as string,
      request.body,
    );
    response.json({ data: result });
  };

  listWorkCenters = async (_request: Request, response: Response) => {
    const result = await this.service.listWorkCenters();
    response.json({ data: result });
  };

  createWorkCenter = async (request: Request, response: Response) => {
    const result = await this.service.createWorkCenter(request.body);
    response.status(201).json({ data: result });
  };

  updateWorkCenter = async (request: Request, response: Response) => {
    const result = await this.service.updateWorkCenter(request.params["id"] as string, request.body);
    response.json({ data: result });
  };

  remove = async (request: Request, response: Response) => {
    const result = await this.service.remove(request.params["id"] as string);
    response.json({ data: result });
  };
}
