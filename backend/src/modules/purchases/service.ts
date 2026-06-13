import { notImplemented } from "../../common/exceptions/not-implemented.js";
import type {
  CancelPurchaseOrderDto,
  ConfirmPurchaseOrderDto,
  CreatePurchaseOrderDto,
  PurchaseOrderListResponseDto,
  PurchaseOrderResponseDto,
  ReceivePurchaseOrderDto,
} from "./dto.js";
import { PurchasesRepository } from "./repository.js";

export class PurchasesService {
  constructor(private readonly repository = new PurchasesRepository()) {}

  async list(): Promise<PurchaseOrderListResponseDto> {
    this.repository.listPurchaseOrders();
  }

  async create(_dto: CreatePurchaseOrderDto): Promise<PurchaseOrderResponseDto> {
    return notImplemented("PurchasesService.create");
  }

  async confirm(_id: string, _dto: ConfirmPurchaseOrderDto): Promise<PurchaseOrderResponseDto> {
    return notImplemented("PurchasesService.confirm");
  }

  async receive(_id: string, _dto: ReceivePurchaseOrderDto): Promise<PurchaseOrderResponseDto> {
    return notImplemented("PurchasesService.receive");
  }

  async cancel(_id: string, _dto: CancelPurchaseOrderDto): Promise<PurchaseOrderResponseDto> {
    return notImplemented("PurchasesService.cancel");
  }
}
