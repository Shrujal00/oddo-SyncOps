"use client";

import { Check, Factory, PackageCheck, Play, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "../../../lib/api";
import { useAppStore } from "../../../store/app-store";

type MoStatus = "DRAFT" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED";
type WoStatus = "PLANNED" | "RELEASED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface Product { id: string; sku: string; name: string; supplyStrategy: "BUY" | "MAKE" }
interface WorkCenter { id: string; name: string; description?: string }
interface WorkOrder {
  id: string;
  operationName: string;
  sequence: number;
  plannedDurationMins?: number;
  workCenter?: WorkCenter;
  status: WoStatus;
}
interface ManufacturingOrder {
  id: string;
  orderNumber: string;
  productId: string;
  product?: Product;
  quantity: number;
  status: MoStatus;
  workOrders: WorkOrder[];
  warnings?: string[];
}

interface ProductsResponse { data: { products: Product[] } }
interface ManufacturingResponse { data: ManufacturingOrder[] }
interface WorkCentersResponse { data: WorkCenter[] }

const STATUS_CLASSES: Record<MoStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};
const WO_STATUSES: WoStatus[] = ["PLANNED", "RELEASED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function ManufacturingPage() {
  const { accessToken, user } = useAppStore();
  const qc = useQueryClient();
  const canWrite = user?.role === "ADMIN" || user?.role === "BUSINESS_OWNER" || user?.role === "MANUFACTURING_USER";
  const isAdmin = user?.role === "ADMIN";
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    productId: "",
    quantity: 1,
    plannedStartDate: "",
    plannedFinishDate: "",
    operations: [{ operationName: "Manufacture", sequence: 1, plannedDurationMins: 60, workCenterId: "" }],
  });
  const [workCenterForm, setWorkCenterForm] = useState({ name: "", description: "" });

  const { data: orders = [], isLoading } = useQuery<ManufacturingOrder[]>({
    queryKey: ["manufacturing-orders"],
    queryFn: async () => (await apiFetch<ManufacturingResponse>("/manufacturing", { token: accessToken ?? undefined })).data,
  });
  const { data: productsData } = useQuery<ProductsResponse["data"]>({
    queryKey: ["products"],
    queryFn: async () => (await apiFetch<ProductsResponse>("/products", { token: accessToken ?? undefined })).data,
  });
  const { data: workCenters = [] } = useQuery<WorkCenter[]>({
    queryKey: ["work-centers"],
    queryFn: async () => (await apiFetch<WorkCentersResponse>("/manufacturing/work-centers", { token: accessToken ?? undefined })).data,
  });

  const createMutation = useMutation({
    mutationFn: () => apiFetch("/manufacturing", {
      method: "POST",
      token: accessToken ?? undefined,
      body: JSON.stringify({
        ...form,
        plannedStartDate: form.plannedStartDate ? new Date(`${form.plannedStartDate}T00:00:00`).toISOString() : undefined,
        plannedFinishDate: form.plannedFinishDate ? new Date(`${form.plannedFinishDate}T00:00:00`).toISOString() : undefined,
        operations: form.operations.map((op) => ({ ...op, workCenterId: op.workCenterId || undefined })),
      }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manufacturing-orders"] });
      closeCreate();
    },
    onError: (e: Error) => setError(e.message),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "confirm" | "start" | "complete" }) => {
      const body =
        action === "confirm" ? { confirmedBy: user?.id } :
        action === "start" ? { startedBy: user?.id, startedAt: new Date().toISOString() } :
        { completedBy: user?.id, completedAt: new Date().toISOString(), producedQuantity: orders.find((o) => o.id === id)?.quantity ?? 1 };
      return apiFetch(`/manufacturing/${id}/${action}`, { method: "POST", token: accessToken ?? undefined, body: JSON.stringify(body) });
    },
    onSuccess: () => {
      setError("");
      qc.invalidateQueries({ queryKey: ["manufacturing-orders"] });
      qc.invalidateQueries({ queryKey: ["inventory-movements"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const workOrderMutation = useMutation({
    mutationFn: ({ moId, woId, status }: { moId: string; woId: string; status: WoStatus }) =>
      apiFetch(`/manufacturing/${moId}/work-orders/${woId}`, { method: "PATCH", token: accessToken ?? undefined, body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["manufacturing-orders"] }),
    onError: (e: Error) => setError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/manufacturing/${id}`, { method: "DELETE", token: accessToken ?? undefined }),
    onSuccess: () => { setError(""); qc.invalidateQueries({ queryKey: ["manufacturing-orders"] }); qc.invalidateQueries({ queryKey: ["products"] }); },
    onError: (e: Error) => setError(e.message),
  });

  const workCenterMutation = useMutation({
    mutationFn: () => apiFetch("/manufacturing/work-centers", { method: "POST", token: accessToken ?? undefined, body: JSON.stringify(workCenterForm) }),
    onSuccess: () => {
      setWorkCenterForm({ name: "", description: "" });
      qc.invalidateQueries({ queryKey: ["work-centers"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const products = (productsData?.products ?? []).filter((product) => product.supplyStrategy === "MAKE");

  function closeCreate() {
    setShowCreate(false);
    setError("");
    setForm({ productId: "", quantity: 1, plannedStartDate: "", plannedFinishDate: "", operations: [{ operationName: "Manufacture", sequence: 1, plannedDurationMins: 60, workCenterId: "" }] });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-elevated">
        <div>
          <h1 className="text-lg font-semibold text-text-1">Manufacturing</h1>
          <p className="text-xs text-text-3 mt-0.5">{orders.length} orders</p>
        </div>
        {canWrite && <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium"><Plus size={16} /> New MO</button>}
      </div>
      {error && <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-xs text-red-700">{error}</div>}

      <div className="px-6 py-3 border-b border-border bg-surface">
        <div className="flex flex-wrap gap-3 items-end">
          <Field label="Work Center" value={workCenterForm.name} onChange={(v) => setWorkCenterForm((f) => ({ ...f, name: v }))} />
          <Field label="Description" value={workCenterForm.description} onChange={(v) => setWorkCenterForm((f) => ({ ...f, description: v }))} />
          <button disabled={!workCenterForm.name || workCenterMutation.isPending} onClick={() => workCenterMutation.mutate()} className="px-3 py-1.5 rounded-lg border border-border text-sm text-text-2 hover:bg-bg disabled:opacity-50">Add Work Center</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-text-3 text-sm">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-text-3 text-sm">No manufacturing orders found</div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border overflow-hidden bg-bg">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-text-2">{order.orderNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_CLASSES[order.status]}`}>{order.status.replaceAll("_", " ")}</span>
                    </div>
                    <p className="text-sm font-medium text-text-1 mt-1">{order.product?.name ?? order.productId} - Qty {order.quantity}</p>
                  </div>
                  {canWrite && (
                    <div className="flex items-center gap-2">
                      {order.status === "DRAFT" && <IconButton label="Confirm" onClick={() => actionMutation.mutate({ id: order.id, action: "confirm" })}><Check size={15} /></IconButton>}
                      {order.status === "CONFIRMED" && <IconButton label="Start" onClick={() => actionMutation.mutate({ id: order.id, action: "start" })}><Play size={15} /></IconButton>}
                      {order.status === "IN_PROGRESS" && <IconButton label="Complete" onClick={() => actionMutation.mutate({ id: order.id, action: "complete" })}><PackageCheck size={15} /></IconButton>}
                      {isAdmin && <IconButton label="Delete" onClick={() => { if (window.confirm(`Delete ${order.orderNumber}?`)) deleteMutation.mutate(order.id); }}><Trash2 size={15} /></IconButton>}
                    </div>
                  )}
                </div>
                {order.warnings?.length ? <div className="px-4 py-2 text-xs text-orange-700 bg-orange-50">{order.warnings.join("; ")}</div> : null}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-bg border-b border-border">
                      {["Seq", "Operation", "Work Center", "Duration", "Status"].map((h) => <th key={h} className="text-left px-4 py-2 text-xs font-medium text-text-3">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {order.workOrders.map((wo) => (
                      <tr key={wo.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-2 text-text-2">{wo.sequence}</td>
                        <td className="px-4 py-2 font-medium text-text-1">{wo.operationName}</td>
                        <td className="px-4 py-2 text-text-2">{wo.workCenter?.name ?? "-"}</td>
                        <td className="px-4 py-2 text-text-2">{wo.plannedDurationMins ?? "-"}</td>
                        <td className="px-4 py-2">
                          <select value={wo.status} onChange={(e) => workOrderMutation.mutate({ moId: order.id, woId: wo.id, status: e.target.value as WoStatus })} className="px-2 py-1 rounded-lg border border-border bg-bg text-xs text-text-1">
                            {WO_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-bg rounded-2xl border border-border shadow-xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text-1">New Manufacturing Order</h2>
              <button onClick={closeCreate} className="text-text-3 hover:text-text-1 text-lg leading-none">x</button>
            </div>
            <div className="overflow-y-auto px-5 py-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Select label="Product" value={form.productId} onChange={(v) => setForm((f) => ({ ...f, productId: v }))}>
                  <option value="">Select product</option>
                  {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
                </Select>
                <Field label="Quantity" type="number" value={String(form.quantity)} onChange={(v) => setForm((f) => ({ ...f, quantity: Number(v) }))} />
                <Field label="Start" type="date" value={form.plannedStartDate} onChange={(v) => setForm((f) => ({ ...f, plannedStartDate: v }))} />
                <Field label="Finish" type="date" value={form.plannedFinishDate} onChange={(v) => setForm((f) => ({ ...f, plannedFinishDate: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-text-2 uppercase tracking-wide">Operations</p>
                <button onClick={() => setForm((f) => ({ ...f, operations: [...f.operations, { operationName: "", sequence: f.operations.length + 1, plannedDurationMins: 60, workCenterId: "" }] }))} className="inline-flex items-center gap-1 text-xs text-accent hover:underline"><Plus size={14} /> Add line</button>
              </div>
              {form.operations.map((operation, index) => (
                <div key={index} className="grid grid-cols-[1fr_5rem_6rem_1fr] gap-2">
                  <Field label="Operation" value={operation.operationName} onChange={(v) => setForm((f) => ({ ...f, operations: f.operations.map((op, i) => i === index ? { ...op, operationName: v } : op) }))} />
                  <Field label="Seq" type="number" value={String(operation.sequence)} onChange={(v) => setForm((f) => ({ ...f, operations: f.operations.map((op, i) => i === index ? { ...op, sequence: Number(v) } : op) }))} />
                  <Field label="Mins" type="number" value={String(operation.plannedDurationMins)} onChange={(v) => setForm((f) => ({ ...f, operations: f.operations.map((op, i) => i === index ? { ...op, plannedDurationMins: Number(v) } : op) }))} />
                  <Select label="Work Center" value={operation.workCenterId} onChange={(v) => setForm((f) => ({ ...f, operations: f.operations.map((op, i) => i === index ? { ...op, workCenterId: v } : op) }))}>
                    <option value="">None</option>
                    {workCenters.map((wc) => <option key={wc.id} value={wc.id}>{wc.name}</option>)}
                  </Select>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-border">
              <button onClick={closeCreate} className="px-4 py-2 rounded-lg text-sm text-text-2 hover:bg-surface">Cancel</button>
              <button disabled={createMutation.isPending || !form.productId} onClick={() => createMutation.mutate()} className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium disabled:opacity-50">
                {createMutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} title={label} aria-label={label} className="h-8 w-8 rounded-lg border border-border text-text-2 hover:text-accent hover:bg-accent-light inline-flex items-center justify-center">{children}</button>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label className="text-xs font-medium text-text-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent min-w-0" />
    </div>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label className="text-xs font-medium text-text-2">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent min-w-0">{children}</select>
    </div>
  );
}
