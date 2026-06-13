import type { AuditEventDto, AuditLogListResponseDto } from "./dto.js";
import { AuditRepository } from "./repository.js";

export class AuditService {
  constructor(private readonly repository = new AuditRepository()) {}

  async list(): Promise<AuditLogListResponseDto> {
    const auditLogs = await this.repository.listAuditLogs();
    return {
      auditLogs: auditLogs.map((log) => ({
        id: log.id,
        userId: log.userId ?? undefined,
        eventType: log.eventType,
        entityType: log.entityType,
        entityId: log.entityId ?? undefined,
        summary: log.summary,
        metadata: log.metadata as Record<string, unknown> | undefined,
        occurredAt: log.occurredAt.toISOString(),
      })),
    };
  }

  async record(event: AuditEventDto): Promise<void> {
    await this.repository.record({
      eventType: event.eventType,
      entityType: event.entityType,
      entityId: event.entityId,
      summary: event.summary,
      userId: event.userId ?? null,
      metadata: event.metadata,
      occurredAt: event.occurredAt ? new Date(event.occurredAt) : undefined,
    });
  }
}
