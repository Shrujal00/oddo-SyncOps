import type { NextFunction, Request, Response } from "express";

export interface AuthenticatedUser {
  id: string;
  role: string;
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function authenticateRequest(
  _request: Request,
  _response: Response,
  next: NextFunction,
) {
  next();
}
