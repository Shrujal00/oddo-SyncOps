"use client";

import { Copy, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "../../../lib/api";
import { useAppStore } from "../../../store/app-store";

interface Product {
  id: string;
  sku: string;
  name: string;
  supplyStrategy: "BUY" | "MAKE";
}

interface WorkCenter {
  id: string;
  name: string;
}

interface BomItem {
  id: string;
  componentProductId: string;
  componentProduct?: Product;
  quantity: number;
  scrapPercentage?: number;
}

interface Bom {
  id: string;
  productId: string;
  name: string;
  version: string;
  isActive: boolean;
  items: BomItem[];
}

interface ProductsResponse { data: { products: Product[] } }
interface BomsResponse { data: Bom[] }
interface WorkCentersResponse { data: WorkCenter[] }

const EMPTY_ITEM = { componentProductId: "", quantity: 1, scrapPercentage: 0 };
const EMPTY_OPERATION = { operationName: "", sequence: 1, plannedDurationMins: 30, workCenterId: "" };

export default function BillOfMaterialsPage() {
  const { accessToken, user } = useAppStore();
  const qc = useQueryClient();
  const canWrite = user?.role === "ADMIN" || user?.role === "BUSINESS_OWNER" || user?.role === "MANUFACTURING_USER";
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    productId: "",
    name: "",
    version: "1",
    isActive: true,
    items: [{ ...EMPTY_ITEM }],
    operations: [{ ...EMPTY_OPERATION }],
  });

  const { data: bomsData, isLoading } = useQuery<Bom[]>({
    queryKey: ["boms"],
    queryFn: async () => {
      const res = await apiFetch<BomsResponse>("/bom", { token: accessToken ?? undefined });
      return res.data;
    },
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
    mutationFn: () => apiFetch("/bom", {
      method: "POST",
      token: accessToken ?? undefined,
      body: JSON.stringify({
        ...form,
        operations: form.operations
          .filter((operation) => operation.operationName)
          .map((operation) => ({ ...operation, workCenterId: operation.workCenterId || undefined })),
      }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boms"] });
      closeCreate();
    },
    onError: (e: Error) => setError(e.message),
  });

  const products = productsData?.products ?? [];
  const finishedProducts = products.filter((product) => product.supplyStrategy === "MAKE");
  const componentProducts = products.filter((product) => product.supplyStrategy === "BUY");
  const boms = bomsData ?? [];

  function closeCreate() {
    setShowCreate(false);
    setError("");
    setForm({ productId: "", name: "", version: "1", isActive: true, items: [{ ...EMPTY_ITEM }], operations: [{ ...EMPTY_OPERATION }] });
  }

  function productName(id: string) {
    const product = products.find((p) => p.id === id);
    return product ? `${product.name} (${product.sku})` : id;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-elevated">
        <div>
          <h1 className="text-lg font-semibold text-text-1">Bill of Materials</h1>
          <p className="text-xs text-text-3 mt-0.5">{boms.length} BoMs</p>
        </div>
        {canWrite && (
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium">
            <Plus size={16} /> New BoM
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-text-3 text-sm">Loading...</div>
        ) : boms.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-text-3 text-sm">No BoMs found</div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {["Product", "BoM ID", "Name", "Version", "Status", "Components"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-text-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {boms.map((bom) => (
                  <tr key={bom.id} className="border-b border-border last:border-0 bg-bg hover:bg-surface">
                    <td className="px-4 py-3 font-medium text-text-1">{productName(bom.productId)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(bom.id)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg px-2 py-1 font-mono text-[11px] text-text-2 hover:bg-surface hover:text-accent"
                        title={bom.id}
                      >
                        <Copy size={12} />
                        {bom.id.slice(0, 8)}...
                      </button>
                    </td>
                    <td className="px-4 py-3 text-text-1">{bom.name}</td>
                    <td className="px-4 py-3 text-text-2">{bom.version}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${bom.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                        {bom.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-2">{bom.items.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-bg rounded-2xl border border-border shadow-xl w-full max-w-3xl mx-4 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text-1">New Bill of Materials</h2>
              <button onClick={closeCreate} className="text-text-3 hover:text-text-1 text-lg leading-none">x</button>
            </div>
            <div className="overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <Select label="Product" value={form.productId} onChange={(v) => setForm((f) => ({ ...f, productId: v }))}>
                  <option value="">Select product</option>
                  {finishedProducts.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
                </Select>
                <Field label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
                <Field label="Version" value={form.version} onChange={(v) => setForm((f) => ({ ...f, version: v }))} />
                <label className="flex items-center gap-2 text-sm text-text-2 pt-6">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="accent-[#714B67]" />
                  Active
                </label>
              </div>

              <LineSection title="Components" onAdd={() => setForm((f) => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }))}>
                {form.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-[1fr_5rem_6rem_2rem] gap-2 items-end">
                    <Select label="Component" value={item.componentProductId} onChange={(v) => setForm((f) => ({ ...f, items: f.items.map((it, i) => i === index ? { ...it, componentProductId: v } : it) }))}>
                      <option value="">Select product</option>
                      {componentProducts.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
                    </Select>
                    <Field label="Qty" type="number" value={String(item.quantity)} onChange={(v) => setForm((f) => ({ ...f, items: f.items.map((it, i) => i === index ? { ...it, quantity: Number(v) } : it) }))} />
                    <Field label="Scrap %" type="number" value={String(item.scrapPercentage ?? 0)} onChange={(v) => setForm((f) => ({ ...f, items: f.items.map((it, i) => i === index ? { ...it, scrapPercentage: Number(v) } : it) }))} />
                    <RemoveButton onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index).length ? f.items.filter((_, i) => i !== index) : [{ ...EMPTY_ITEM }] }))} />
                  </div>
                ))}
              </LineSection>

              <LineSection title="Operations" onAdd={() => setForm((f) => ({ ...f, operations: [...f.operations, { ...EMPTY_OPERATION, sequence: f.operations.length + 1 }] }))}>
                {form.operations.map((operation, index) => (
                  <div key={index} className="grid grid-cols-[1fr_5rem_6rem_1fr_2rem] gap-2 items-end">
                    <Field label="Operation" value={operation.operationName} onChange={(v) => setForm((f) => ({ ...f, operations: f.operations.map((op, i) => i === index ? { ...op, operationName: v } : op) }))} />
                    <Field label="Seq" type="number" value={String(operation.sequence)} onChange={(v) => setForm((f) => ({ ...f, operations: f.operations.map((op, i) => i === index ? { ...op, sequence: Number(v) } : op) }))} />
                    <Field label="Mins" type="number" value={String(operation.plannedDurationMins)} onChange={(v) => setForm((f) => ({ ...f, operations: f.operations.map((op, i) => i === index ? { ...op, plannedDurationMins: Number(v) } : op) }))} />
                    <Select label="Work Center" value={operation.workCenterId} onChange={(v) => setForm((f) => ({ ...f, operations: f.operations.map((op, i) => i === index ? { ...op, workCenterId: v } : op) }))}>
                      <option value="">None</option>
                      {workCenters.map((wc) => <option key={wc.id} value={wc.id}>{wc.name}</option>)}
                    </Select>
                    <RemoveButton onClick={() => setForm((f) => ({ ...f, operations: f.operations.filter((_, i) => i !== index).length ? f.operations.filter((_, i) => i !== index) : [{ ...EMPTY_OPERATION }] }))} />
                  </div>
                ))}
              </LineSection>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-border">
              <button onClick={closeCreate} className="px-4 py-2 rounded-lg text-sm text-text-2 hover:bg-surface">Cancel</button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !form.productId || !form.name || form.items.some((item) => !item.componentProductId)}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LineSection({ title, onAdd, children }: { title: string; onAdd: () => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-text-2 uppercase tracking-wide">{title}</p>
        <button onClick={onAdd} className="inline-flex items-center gap-1 text-xs text-accent hover:underline"><Plus size={14} /> Add line</button>
      </div>
      {children}
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="h-8 w-8 rounded-lg text-text-3 hover:text-red-600 hover:bg-red-50 inline-flex items-center justify-center" aria-label="Remove line">
      <Trash2 size={15} />
    </button>
  );
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
      <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent min-w-0">
        {children}
      </select>
    </div>
  );
}
