"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../lib/api";
import { useAppStore } from "../../../store/app-store";

interface ProcurementAction {
  id: string;
  salesOrderId?: string;
  productId?: string;
  actionType?: "CREATE_PURCHASE_ORDER" | "CREATE_MANUFACTURING_ORDER";
  createdEntityType?: "PurchaseOrder" | "ManufacturingOrder";
  createdEntityId?: string;
  summary: string;
  occurredAt: string;
}

interface ProcurementResponse {
  data: { actions: ProcurementAction[]; total: number };
}

const ACTION_CLASSES: Record<string, string> = {
  CREATE_PURCHASE_ORDER: "bg-emerald-100 text-emerald-700",
  CREATE_MANUFACTURING_ORDER: "bg-orange-100 text-orange-700",
};

export default function ProcurementPage() {
  const { accessToken } = useAppStore();
  const { data, isLoading } = useQuery<ProcurementResponse["data"]>({
    queryKey: ["procurement-actions"],
    queryFn: async () => {
      const res = await apiFetch<ProcurementResponse>("/procurement", { token: accessToken ?? undefined });
      return res.data;
    },
  });

  const actions = data?.actions ?? [];

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border bg-elevated">
        <h1 className="text-lg font-semibold text-text-1">Procurement</h1>
        <p className="text-xs text-text-3 mt-0.5">{data?.total ?? 0} auto-created actions</p>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-text-3 text-sm">Loading...</div>
        ) : actions.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-text-3 text-sm">No procurement actions found</div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {["Date", "Source Sales Order", "Product", "Action", "Created", "Summary"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-text-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {actions.map((action) => (
                  <tr key={action.id} className="border-b border-border last:border-0 bg-bg hover:bg-surface transition-colors">
                    <td className="px-4 py-3 text-text-2 whitespace-nowrap">
                      {new Date(action.occurredAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-2">{action.salesOrderId ? `...${action.salesOrderId.slice(-8)}` : "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-2">{action.productId ? `...${action.productId.slice(-8)}` : "-"}</td>
                    <td className="px-4 py-3">
                      {action.actionType ? (
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${ACTION_CLASSES[action.actionType]}`}>
                          {action.actionType.replace("CREATE_", "").replaceAll("_", " ")}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 text-text-2">
                      {action.createdEntityType && action.createdEntityId
                        ? `${action.createdEntityType} ...${action.createdEntityId.slice(-8)}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-text-1">{action.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
