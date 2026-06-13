import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export function requireRoles(...roles: string[]) {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    const userRole = request.user?.roleName;
    if (!userRole || !roles.includes(userRole)) {
      response.status(403).json({ message: "Insufficient permissions" });
      return;
    }
    next();
  };
}
