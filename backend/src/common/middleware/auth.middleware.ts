import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export interface JwtPayload {
  sub: string;
  roleId: string;
  roleName: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authenticateRequest(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    response.status(401).json({ message: "Missing authorization token" });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    request.user = payload;
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired token" });
  }
}
