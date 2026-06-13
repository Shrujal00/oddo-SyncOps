import { notImplemented } from "../../common/exceptions/not-implemented.js";
import type { AuditEventDto, AuditLogListResponseDto } from "./dto.js";
import { AuditRepository } from "./repository.js";

export class AuditService {
  constructor(private readonly repository = new AuditRepository()) {}

  async list(): Promise<AuditLogListResponseDto> {
    this.repository.listAuditLogs();
  }

  async record(_event: AuditEventDto): Promise<void> {
    return notImplemented("AuditService.record");
  }
}
