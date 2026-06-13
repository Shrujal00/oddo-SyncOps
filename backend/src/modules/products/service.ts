import { notImplemented } from "../../common/exceptions/not-implemented.js";
import type { CreateProductDto, ProductListResponseDto, ProductResponseDto, UpdateProductDto } from "./dto.js";
import { ProductsRepository } from "./repository.js";

export class ProductsService {
  constructor(private readonly repository = new ProductsRepository()) {}

  async list(): Promise<ProductListResponseDto> {
    this.repository.listProducts();
  }

  async create(_dto: CreateProductDto): Promise<ProductResponseDto> {
    return notImplemented("ProductsService.create");
  }

  async update(_id: string, _dto: UpdateProductDto): Promise<ProductResponseDto> {
    return notImplemented("ProductsService.update");
  }
}
