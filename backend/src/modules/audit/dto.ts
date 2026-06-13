export type AuditEventType =
  | "USER_LOGIN"
  | "USER_CHANGED"
  | "PRODUCT_UPDATED"
  | "SALES_ORDER_CHANGED"
  | "PURCHASE_ORDER_CHANGED"
  | "MANUFACTURING_COMPLETED"
  | "INVENTORY_CHANGED";

export interface AuditEventDto {
  userId?: string;
  eventType: AuditEventType;
  entityType: string;
  entityId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
  occurredAt: string;
}

export interface AuditLogResponseDto extends AuditEventDto {
  id: string;
}

export interface AuditLogListResponseDto {
  auditLogs: AuditLogResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditLogListFiltersDto {
  entityType?: string;
  entityId?: string;
  eventType?: AuditEventType;
  userId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}
