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

export class AuditRepository {
  listAuditLogs() {
    return prisma.auditLog.findMany({
      where: { deletedAt: null },
      orderBy: { occurredAt: "desc" },
      take: 100,
    });
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
}
