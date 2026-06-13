import type { AuditEventType } from "./dto.js";

export interface AuditServiceContract {
  record: (event: {
    eventType: AuditEventType;
    entityType: string;
    entityId?: string;
    summary: string;
  }) => Promise<void>;
}
