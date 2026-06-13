# 07 — Audit Logs

## Tasks

### AUDIT-01 · Audit write helper
**Status:** DONE
**Files:** `backend/src/modules/audit/repository.ts`  
**What to implement:**
```ts
async logEvent(data: {
  userId?: string;
  eventType: AuditEventType;
  entityType: string;
  entityId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}): Promise<void>
```
Called internally by every service on status changes. Never exposed as HTTP write endpoint.

### AUDIT-02 · Audit log list (HTTP)
**Status:** DONE
**Files:** `backend/src/modules/audit/service.ts`, `controller.ts`  
**What to implement:**
- `GET /api/audit?entityType=&entityId=&eventType=&from=&to=&userId=` — paginated
- Admin: all events
- Other roles: filtered to own events (userId = req.user.sub) or their module events
- Default sort: occurredAt DESC
