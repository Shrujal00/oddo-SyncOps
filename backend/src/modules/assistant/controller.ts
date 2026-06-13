import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../common/middleware/auth.middleware.js";
import { HttpError } from "../../common/exceptions/http-error.js";
import { AssistantService } from "./service.js";

export class AssistantController {
  constructor(private readonly service = new AssistantService()) {}

  chat = async (request: Request, response: Response) => {
    const authenticatedRequest = request as AuthenticatedRequest;
    if (!authenticatedRequest.user) throw new HttpError(401, "Missing authenticated user");
    const result = await this.service.chat(request.body, { roleName: authenticatedRequest.user.roleName });
    response.json({ data: result });
  };

  reindex = async (_request: Request, response: Response) => {
    const result = await this.service.reindex();
    response.json({ data: result });
  };
}
