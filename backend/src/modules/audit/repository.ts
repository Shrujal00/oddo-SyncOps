import type { AuditEventType, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma.js";

export interface AuditRecordInput {
  eventType: AuditEventType;
  entityType: string;
  entityId?: string;
  summary: string;
  userId?: string | null;
  metadata?: Record<string, unknown>;
  occurredAt?: Date;
}

export interface ListAuditLogsFilters {
  entityType?: string;
  entityId?: string;
  eventType?: AuditEventType;
  userId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
  allowedEventTypes?: AuditEventType[];
  currentUserId?: string;
  isAdmin?: boolean;
}

export class AuditRepository {
  async listAuditLogs(filters: ListAuditLogsFilters = {}) {
    const { page = 1, limit = 25 } = filters;
    const where: Prisma.AuditLogWhereInput = {
      deletedAt: null,
      ...(filters.entityType && { entityType: filters.entityType }),
      ...(filters.entityId && { entityId: filters.entityId }),
      ...(filters.eventType && { eventType: filters.eventType }),
      ...(filters.userId && { userId: filters.userId }),
      ...((filters.from || filters.to) && {
        occurredAt: {
          ...(filters.from && { gte: filters.from }),
          ...(filters.to && { lte: filters.to }),
        },
      }),
      ...(!filters.isAdmin && filters.currentUserId && {
        OR: [
          { userId: filters.currentUserId },
          ...(filters.allowedEventTypes?.length ? [{ eventType: { in: filters.allowedEventTypes } }] : []),
        ],
      }),
    };

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { occurredAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { auditLogs, total, page, limit };
  }

  async record(event: AuditRecordInput) {
    await prisma.auditLog.create({
      data: {
        eventType: event.eventType,
        entityType: event.entityType,
        entityId: event.entityId ?? null,
        summary: event.summary,
        userId: event.userId ?? null,
        metadata: event.metadata as Prisma.InputJsonValue | undefined,
        occurredAt: event.occurredAt ?? new Date(),
      },
    });
  }

  async logEvent(event: AuditRecordInput) {
    await this.record(event);
  }
}
