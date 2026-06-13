import type { Request, Response } from "express";
import type { RoleName } from "@prisma/client";
import type { AuthenticatedRequest } from "../../common/middleware/auth.middleware.js";
import { UsersService } from "./service.js";

export class UsersController {
  constructor(private readonly service = new UsersService()) {}

  list = async (_request: Request, response: Response) => {
    const result = await this.service.list();
    response.json({ data: result });
  };

  roles = async (_request: Request, response: Response) => {
    const result = await this.service.roles();
    response.json({ data: result });
  };

  create = async (request: AuthenticatedRequest, response: Response) => {
    const result = await this.service.create(request.body, request.user);
    response.status(201).json({ data: result });
  };

  update = async (request: AuthenticatedRequest, response: Response) => {
    const result = await this.service.update(request.params["id"] as string, request.body, request.user);
    response.json({ data: result });
  };

  updateRole = async (request: AuthenticatedRequest, response: Response) => {
    const result = await this.service.updateRole(request.params["roleName"] as RoleName, request.body, request.user);
    response.json({ data: result });
  };

  activate = async (request: AuthenticatedRequest, response: Response) => {
    const result = await this.service.activate(request.params["id"] as string, request.user);
    response.json({ data: result });
  };

  deactivate = async (request: AuthenticatedRequest, response: Response) => {
    const result = await this.service.deactivate(request.params["id"] as string, request.user);
    response.json({ data: result });
  };

  remove = async (request: AuthenticatedRequest, response: Response) => {
    const result = await this.service.remove(request.params["id"] as string, request.user);
    response.json({ data: result });
  };
}
