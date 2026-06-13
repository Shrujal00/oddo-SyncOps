import { notImplemented } from "../../common/exceptions/not-implemented.js";
import type {
  CancelSalesOrderDto,
  ConfirmSalesOrderDto,
  CreateSalesOrderDto,
  DeliverSalesOrderDto,
  SalesOrderListResponseDto,
  SalesOrderResponseDto,
  UpdateSalesOrderDto,
} from "./dto.js";
import { SalesRepository } from "./repository.js";

export class SalesService {
  constructor(private readonly repository = new SalesRepository()) {}

  async list(): Promise<SalesOrderListResponseDto> {
    this.repository.listSalesOrders();
  }

  async create(_dto: CreateSalesOrderDto): Promise<SalesOrderResponseDto> {
    return notImplemented("SalesService.create");
  }

  async update(_id: string, _dto: UpdateSalesOrderDto): Promise<SalesOrderResponseDto> {
    return notImplemented("SalesService.update");
  }

  async confirm(_id: string, _dto: ConfirmSalesOrderDto): Promise<SalesOrderResponseDto> {
    return notImplemented("SalesService.confirm");
  }

  async deliver(_id: string, _dto: DeliverSalesOrderDto): Promise<SalesOrderResponseDto> {
    return notImplemented("SalesService.deliver");
  }

  async cancel(_id: string, _dto: CancelSalesOrderDto): Promise<SalesOrderResponseDto> {
    return notImplemented("SalesService.cancel");
  }
}
