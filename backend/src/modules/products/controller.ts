import type { Request, Response } from "express";
import { ProductsService } from "./service.js";

export class ProductsController {
  constructor(private readonly service = new ProductsService()) {}

  list = async (request: Request, response: Response) => {
    const { sku, name, lowStockOnly, productType, page, limit } = request.query as Record<string, string>;
    const result = await this.service.list({
      sku,
      name,
      productType: productType === "RAW_MATERIAL" || productType === "FINISHED_PRODUCT" ? productType : undefined,
      lowStockOnly: lowStockOnly === "true",
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    response.json({ data: result });
  };

  get = async (request: Request, response: Response) => {
    const result = await this.service.getOne(request.params["id"] as string);
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

  remove = async (request: Request, response: Response) => {
    const result = await this.service.remove(request.params["id"] as string);
    response.json({ data: result });
  };
}
