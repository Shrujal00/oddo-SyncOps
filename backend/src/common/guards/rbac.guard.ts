import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export function requirePermissions(...permissions: string[]) {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    const granted = request.user?.permissions ?? [];
    const allowed = permissions.every((permission) => granted.includes(permission));

    if (!allowed) {
      response.status(403).json({ message: "Missing required permission" });
      return;
    }

    next();
  };
}
