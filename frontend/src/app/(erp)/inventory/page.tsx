"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "../../../store/app-store";
import { apiFetch } from "../../../lib/api";

type MovementType = "SALE" | "PURCHASE" | "CONSUMPTION" | "PRODUCTION" | "ADJUSTMENT";

interface Movement {
  id: string;
  productId: string;
  product: { id: string; sku: string; name: string };
  movementType: MovementType;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  occurredAt: string;
}

interface MovementsResponse {
  data: {
    entries: Movement[];
    total: number;
    page: number;
    pageSize: number;
  };
}

const TYPE_COLORS: Record<MovementType, string> = {
  PURCHASE:    "bg-emerald-100 text-emerald-700",
  PRODUCTION:  "bg-blue-100 text-blue-700",
  SALE:        "bg-red-100 text-red-700",
  CONSUMPTION: "bg-orange-100 text-orange-700",
  ADJUSTMENT:  "bg-purple-100 text-purple-700",
};

const MOVEMENT_TYPES: MovementType[] = ["SALE", "PURCHASE", "CONSUMPTION", "PRODUCTION", "ADJUSTMENT"];

export default function InventoryPage() {
  const { accessToken, user } = useAppStore();
  const qc = useQueryClient();
  const canAdjust = user?.role === "ADMIN" || user?.role === "INVENTORY_MANAGER";

  const [filters, setFilters] = useState({ productId: "", type: "" as MovementType | "", from: "", to: "" });
  const [page, setPage] = useState(1);
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [adjForm, setAdjForm] = useState({ productId: "", quantityDelta: 0, reason: "" });
  const [adjError, setAdjError] = useState("");

  const params = new URLSearchParams({ page: String(page), pageSize: "25" });
  if (filters.productId) params.set("productId", filters.productId);
  if (filters.type) params.set("type", filters.type);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const { data, isLoading } = useQuery<MovementsResponse["data"]>({
    queryKey: ["inventory-movements", filters, page],
    queryFn: async () => {
      const res = await apiFetch<MovementsResponse>(`/inventory/movements?${params}`, {
        token: accessToken ?? undefined,
      });
      return res.data;
    },
  });

  const adjustMutation = useMutation({
    mutationFn: () =>
      apiFetch("/inventory/adjustments", {
        method: "POST",
        body: JSON.stringify(adjForm),
        token: accessToken ?? undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory-movements"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setAdjForm({ productId: "", quantityDelta: 0, reason: "" });
      setAdjError("");
      setShowAdjustForm(false);
    },
    onError: (e: Error) => setAdjError(e.message),
  });

  const movements = data?.entries ?? [];
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-elevated">
        <div>
          <h1 className="text-lg font-semibold text-text-1">Inventory</h1>
          <p className="text-xs text-text-3 mt-0.5">{data?.total ?? 0} movements</p>
        </div>
        {canAdjust && (
          <button
            onClick={() => setShowAdjustForm((v) => !v)}
            className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
          >
            {showAdjustForm ? "Cancel Adjustment" : "+ Stock Adjustment"}
          </button>
        )}
      </div>

      {/* Adjustment Form */}
      {showAdjustForm && canAdjust && (
        <div className="px-6 py-4 bg-surface border-b border-border">
          <p className="text-xs font-semibold text-text-2 uppercase tracking-wide mb-3">Manual Adjustment</p>
          {adjError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{adjError}</p>
          )}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-2">Product ID (UUID)</label>
              <input
                value={adjForm.productId}
                onChange={(e) => setAdjForm((f) => ({ ...f, productId: e.target.value }))}
                placeholder="xxxxxxxx-…"
                className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent w-72"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-2">Qty Delta (±)</label>
              <input
                type="number"
                value={adjForm.quantityDelta}
                onChange={(e) => setAdjForm((f) => ({ ...f, quantityDelta: Number(e.target.value) }))}
                className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent w-28"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-48">
              <label className="text-xs font-medium text-text-2">Reason</label>
              <input
                value={adjForm.reason}
                onChange={(e) => setAdjForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="Stock count correction…"
                className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent w-full"
              />
            </div>
            <button
              onClick={() => adjustMutation.mutate()}
              disabled={adjustMutation.isPending || !adjForm.productId || !adjForm.reason}
              className="px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {adjustMutation.isPending ? "Saving…" : "Apply"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-border bg-bg">
        <input
          value={filters.productId}
          onChange={(e) => { setFilters((f) => ({ ...f, productId: e.target.value })); setPage(1); }}
          placeholder="Filter by product ID…"
          className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-1 focus:ring-accent w-56"
        />
        <select
          value={filters.type}
          onChange={(e) => { setFilters((f) => ({ ...f, type: e.target.value as MovementType | "" })); setPage(1); }}
          className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All types</option>
          {MOVEMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={filters.from}
            onChange={(e) => { setFilters((f) => ({ ...f, from: e.target.value })); setPage(1); }}
            className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <span className="text-text-3 text-xs">to</span>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => { setFilters((f) => ({ ...f, to: e.target.value })); setPage(1); }}
            className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        {(filters.productId || filters.type || filters.from || filters.to) && (
          <button
            onClick={() => { setFilters({ productId: "", type: "", from: "", to: "" }); setPage(1); }}
            className="text-xs text-text-3 hover:text-text-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-text-3 text-sm">Loading…</div>
        ) : movements.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-text-3 text-sm">No movements found</div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {["Product", "Type", "Qty", "Reference", "Notes", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-text-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => {
                  const isNeg = m.movementType === "SALE" || m.movementType === "CONSUMPTION";
                  return (
                    <tr key={m.id} className="border-b border-border last:border-0 bg-bg hover:bg-surface transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-text-1">{m.product.name}</span>
                        <span className="ml-1.5 font-mono text-xs text-text-3">{m.product.sku}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${TYPE_COLORS[m.movementType]}`}>
                          {m.movementType}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-semibold tabular-nums ${isNeg ? "text-red-600" : "text-emerald-600"}`}>
                        {isNeg ? "-" : "+"}{Math.abs(m.quantity)}
                      </td>
                      <td className="px-4 py-3 text-text-2 text-xs font-mono">
                        {m.referenceType && m.referenceId
                          ? `${m.referenceType} …${m.referenceId.slice(-8)}`
                          : <span className="text-text-3">—</span>}
                      </td>
                      <td className="px-4 py-3 text-text-2 max-w-48 truncate">
                        {m.notes ?? <span className="text-text-3">—</span>}
                      </td>
                      <td className="px-4 py-3 text-text-2 text-xs whitespace-nowrap">
                        {new Date(m.occurredAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-6 py-3 border-t border-border">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 rounded-lg border border-border text-sm text-text-2 hover:bg-surface disabled:opacity-40 transition-colors"
          >
            ←
          </button>
          <span className="text-sm text-text-2">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded-lg border border-border text-sm text-text-2 hover:bg-surface disabled:opacity-40 transition-colors"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
