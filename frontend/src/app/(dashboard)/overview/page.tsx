"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../lib/api";
import { useAppStore } from "../../../store/app-store";

interface DashboardSummary {
  salesOrders: { total: number; pendingDeliveries: number };
  purchaseOrders: { total: number; partialReceipts: number };
  manufacturingOrders: { total: number; inProgress: number };
  lowStockProducts: Array<{ id: string; sku: string; name: string; freeToUseQty: number; reorderPoint: number }>;
}

interface DashboardResponse {
  data: DashboardSummary;
}

export default function OverviewPage() {
  const { accessToken } = useAppStore();
  const { data, isLoading } = useQuery<DashboardSummary>({
    queryKey: ["dashboard"],
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const res = await apiFetch<DashboardResponse>("/dashboard", { token: accessToken ?? undefined });
      return res.data;
    },
  });

  const cards = [
    { label: "Sales Orders", value: data?.salesOrders.total ?? 0, sub: `${data?.salesOrders.pendingDeliveries ?? 0} pending deliveries` },
    { label: "Purchase Orders", value: data?.purchaseOrders.total ?? 0, sub: `${data?.purchaseOrders.partialReceipts ?? 0} partial receipts` },
    { label: "Manufacturing", value: data?.manufacturingOrders.total ?? 0, sub: `${data?.manufacturingOrders.inProgress ?? 0} in progress` },
    { label: "Low Stock", value: data?.lowStockProducts.length ?? 0, sub: "products below reorder point" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border bg-elevated">
        <h1 className="text-lg font-semibold text-text-1">Overview</h1>
        <p className="text-xs text-text-3 mt-0.5">Business at a glance</p>
      </div>
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {cards.map((card) => (
            <div key={card.label} className="bg-elevated border border-border rounded-xl p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-text-2">{card.label}</p>
              <p className="text-2xl font-semibold text-text-1 mt-2">{isLoading ? "..." : card.value}</p>
              <p className="text-xs text-text-3 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 bg-surface border-b border-border">
            <h2 className="text-sm font-semibold text-text-1">Low Stock Products</h2>
          </div>
          {isLoading ? (
            <div className="p-6 text-sm text-text-3">Loading...</div>
          ) : (data?.lowStockProducts.length ?? 0) === 0 ? (
            <div className="p-6 text-sm text-text-3">No low stock products</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {["SKU", "Product", "Free to Use", "Reorder Point"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-text-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.lowStockProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 bg-bg">
                    <td className="px-4 py-3 font-mono text-xs text-text-2">{product.sku}</td>
                    <td className="px-4 py-3 font-medium text-text-1">{product.name}</td>
                    <td className="px-4 py-3 font-semibold text-orange-600">{product.freeToUseQty}</td>
                    <td className="px-4 py-3 text-text-2">{product.reorderPoint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
