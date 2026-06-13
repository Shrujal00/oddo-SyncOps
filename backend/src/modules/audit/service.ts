import type { JwtPayload } from "../../common/middleware/auth.middleware.js";
import type { AuditEventDto, AuditEventType, AuditLogListFiltersDto, AuditLogListResponseDto } from "./dto.js";
import { AuditRepository } from "./repository.js";

function allowedEventTypesForRole(roleName?: string): AuditEventType[] {
  switch (roleName) {
    case "SALES_USER":
      return ["SALES_ORDER_CHANGED"];
    case "PURCHASE_USER":
      return ["PURCHASE_ORDER_CHANGED"];
    case "MANUFACTURING_USER":
      return ["MANUFACTURING_COMPLETED"];
    case "INVENTORY_MANAGER":
      return ["INVENTORY_CHANGED"];
    case "BUSINESS_OWNER":
      return ["SALES_ORDER_CHANGED", "PURCHASE_ORDER_CHANGED", "MANUFACTURING_COMPLETED", "INVENTORY_CHANGED", "PRODUCT_UPDATED"];
    default:
      return [];
  }
}

export class AuditService {
  constructor(private readonly repository = new AuditRepository()) {}

  async list(filters: AuditLogListFiltersDto = {}, user?: JwtPayload): Promise<AuditLogListResponseDto> {
    const result = await this.repository.listAuditLogs({
      ...filters,
      isAdmin: user?.roleName === "ADMIN",
      currentUserId: user?.sub,
      allowedEventTypes: allowedEventTypesForRole(user?.roleName),
    });
    return {
      auditLogs: result.auditLogs.map((log) => ({
        id: log.id,
        userId: log.userId ?? undefined,
        eventType: log.eventType,
        entityType: log.entityType,
        entityId: log.entityId ?? undefined,
        summary: log.summary,
        metadata: log.metadata as Record<string, unknown> | undefined,
        occurredAt: log.occurredAt.toISOString(),
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
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
