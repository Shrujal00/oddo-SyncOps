"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../lib/api";
import { useAppStore } from "../../../store/app-store";

type AuditEventType =
  | "USER_LOGIN"
  | "PRODUCT_UPDATED"
  | "SALES_ORDER_CHANGED"
  | "PURCHASE_ORDER_CHANGED"
  | "MANUFACTURING_COMPLETED"
  | "INVENTORY_CHANGED";

interface AuditLog {
  id: string;
  userId?: string;
  eventType: AuditEventType;
  entityType: string;
  entityId?: string;
  summary: string;
  occurredAt: string;
}

interface AuditResponse {
  data: { auditLogs: AuditLog[]; total: number; page: number; limit: number };
}

const EVENT_TYPES: AuditEventType[] = [
  "USER_LOGIN",
  "PRODUCT_UPDATED",
  "SALES_ORDER_CHANGED",
  "PURCHASE_ORDER_CHANGED",
  "MANUFACTURING_COMPLETED",
  "INVENTORY_CHANGED",
];

const TYPE_COLORS: Record<AuditEventType, string> = {
  USER_LOGIN: "bg-gray-100 text-gray-700",
  PRODUCT_UPDATED: "bg-purple-100 text-purple-700",
  SALES_ORDER_CHANGED: "bg-blue-100 text-blue-700",
  PURCHASE_ORDER_CHANGED: "bg-emerald-100 text-emerald-700",
  MANUFACTURING_COMPLETED: "bg-orange-100 text-orange-700",
  INVENTORY_CHANGED: "bg-red-100 text-red-700",
};

export default function AuditPage() {
  const { accessToken } = useAppStore();
  const [filters, setFilters] = useState({ eventType: "", entityType: "", from: "", to: "" });
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ page: String(page), limit: "25" });
  if (filters.eventType) params.set("eventType", filters.eventType);
  if (filters.entityType) params.set("entityType", filters.entityType);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const { data, isLoading } = useQuery<AuditResponse["data"]>({
    queryKey: ["audit", filters, page],
    queryFn: async () => {
      const res = await apiFetch<AuditResponse>(`/audit?${params}`, { token: accessToken ?? undefined });
      return res.data;
    },
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border bg-elevated">
        <h1 className="text-lg font-semibold text-text-1">Audit Logs</h1>
        <p className="text-xs text-text-3 mt-0.5">{data?.total ?? 0} events</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-border bg-bg">
        <select
          value={filters.eventType}
          onChange={(e) => { setFilters((f) => ({ ...f, eventType: e.target.value })); setPage(1); }}
          className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All events</option>
          {EVENT_TYPES.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}
        </select>
        <input
          value={filters.entityType}
          onChange={(e) => { setFilters((f) => ({ ...f, entityType: e.target.value })); setPage(1); }}
          placeholder="Entity type"
          className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-1 focus:ring-accent w-44"
        />
        <input
          type="date"
          value={filters.from}
          onChange={(e) => { setFilters((f) => ({ ...f, from: e.target.value })); setPage(1); }}
          className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => { setFilters((f) => ({ ...f, to: e.target.value })); setPage(1); }}
          className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-text-3 text-sm">Loading...</div>
        ) : (data?.auditLogs.length ?? 0) === 0 ? (
          <div className="flex items-center justify-center h-40 text-text-3 text-sm">No audit events found</div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {["Timestamp", "User", "Event Type", "Entity", "Summary"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-text-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 bg-bg hover:bg-surface transition-colors">
                    <td className="px-4 py-3 text-text-2 whitespace-nowrap">
                      {new Date(log.occurredAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-3">{log.userId ? `...${log.userId.slice(-8)}` : "system"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${TYPE_COLORS[log.eventType]}`}>
                        {log.eventType.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-2">{log.entityType}{log.entityId ? ` ...${log.entityId.slice(-8)}` : ""}</td>
                    <td className="px-4 py-3 text-text-1">{log.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-6 py-3 border-t border-border">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 rounded-lg border border-border text-sm text-text-2 hover:bg-surface disabled:opacity-40">Prev</button>
          <span className="text-sm text-text-2">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded-lg border border-border text-sm text-text-2 hover:bg-surface disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
