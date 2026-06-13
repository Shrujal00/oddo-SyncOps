import type { Response } from "express";
import type { AuthenticatedRequest } from "../../common/middleware/auth.middleware.js";
import { InventoryMovementType } from "@prisma/client";
import { InventoryService } from "./service.js";

export class InventoryController {
  constructor(private readonly service = new InventoryService()) {}

  movements = async (request: AuthenticatedRequest, response: Response) => {
    const { productId, type, from, to, page, pageSize } = request.query as Record<string, string>;
    const result = await this.service.listMovements({
      productId,
      type: type as InventoryMovementType | undefined,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    response.json({ data: result });
  };

  ledger = async (_request: AuthenticatedRequest, response: Response) => {
    const result = await this.service.ledger();
    response.json({ data: result });
  };

  reserve = async (request: AuthenticatedRequest, response: Response) => {
    await this.service.reserve(request.body);
    response.status(202).json({ data: null });
  };

  release = async (request: AuthenticatedRequest, response: Response) => {
    await this.service.release(request.body);
    response.status(202).json({ data: null });
  };

  adjust = async (request: AuthenticatedRequest, response: Response) => {
    await this.service.adjust({
      ...request.body,
      adjustedBy: request.user!.sub,
    });
    response.status(202).json({ data: null });
  };
}
