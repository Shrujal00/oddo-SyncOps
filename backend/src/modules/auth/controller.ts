import type { Request, Response } from "express";
import { AuthService } from "./service.js";

export class AuthController {
  constructor(private readonly service = new AuthService()) {}

  login = async (request: Request, response: Response) => {
    const result = await this.service.login(request.body);
    response.status(200).json({ data: result });
  };

  register = async (request: Request, response: Response) => {
    const result = await this.service.register(request.body);
    response.status(201).json({ data: result });
  };

  forgotPassword = async (request: Request, response: Response) => {
    await this.service.requestPasswordReset(request.body);
    response.status(202).json({ data: null });
  };
}
