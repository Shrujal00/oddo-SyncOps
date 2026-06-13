"use client";

import type { ReactNode } from "react";
import { Check, PackageCheck, Plus, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "../../../lib/api";
import { useAppStore } from "../../../store/app-store";

type PurchaseStatus = "DRAFT" | "CONFIRMED" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";

interface Vendor {
  id: string;
  name: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  standardCost: number;
}

interface PurchaseOrderItem {
  id: string;
  productId: string;
  product?: { id: string; sku: string; name: string };
  quantity: number;
  receivedQty: number;
  unitCost: number;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  vendorId: string;
  vendor?: Vendor;
  status: PurchaseStatus;
  orderDate: string;
  expectedDate?: string;
  notes?: string;
  items: PurchaseOrderItem[];
  totalValue: number;
}

interface PurchasesResponse {
  data: { purchaseOrders: PurchaseOrder[] };
}

interface VendorsResponse {
  data: { vendors: Vendor[] };
}

interface ProductsResponse {
  data: { products: Product[] };
}

interface LineForm {
  productId: string;
  quantity: number;
  unitCost: number;
}

const STATUS_CLASSES: Record<PurchaseStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PARTIALLY_RECEIVED: "bg-orange-100 text-orange-700",
  RECEIVED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const EMPTY_LINE: LineForm = { productId: "", quantity: 1, unitCost: 0 };

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function toIsoDate(date: string) {
  return new Date(`${date}T00:00:00`).toISOString();
}

function currency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export default function PurchasesPage() {
  const { accessToken, user } = useAppStore();
  const qc = useQueryClient();
  const canWrite = user?.role === "ADMIN" || user?.role === "BUSINESS_OWNER" || user?.role === "PURCHASE_USER";

  const [showCreate, setShowCreate] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<PurchaseOrder | null>(null);
  const [createError, setCreateError] = useState("");
  const [actionError, setActionError] = useState("");
  const [form, setForm] = useState({
    vendorId: "",
    orderDate: todayInputValue(),
    expectedDate: "",
    notes: "",
    items: [{ ...EMPTY_LINE }],
  });
  const [receiptQty, setReceiptQty] = useState<Record<string, number>>({});

  const { data, isLoading } = useQuery<PurchasesResponse["data"]>({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const res = await apiFetch<PurchasesResponse>("/purchases", { token: accessToken ?? undefined });
      return res.data;
    },
  });

  const { data: vendorsData } = useQuery<VendorsResponse["data"]>({
    queryKey: ["vendors"],
    queryFn: async () => {
      const res = await apiFetch<VendorsResponse>("/vendors", { token: accessToken ?? undefined });
      return res.data;
    },
  });

  const { data: productsData } = useQuery<ProductsResponse["data"]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await apiFetch<ProductsResponse>("/products", { token: accessToken ?? undefined });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch("/purchases", {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify({
          vendorId: form.vendorId,
          orderDate: toIsoDate(form.orderDate),
          expectedDate: form.expectedDate ? toIsoDate(form.expectedDate) : undefined,
          notes: form.notes || undefined,
          items: form.items,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
      closeCreate();
    },
    onError: (e: Error) => setCreateError(e.message),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/purchases/${id}/confirm`, {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify({ confirmedBy: user?.id }),
      }),
    onSuccess: () => {
      setActionError("");
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/purchases/${id}/cancel`, {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify({ cancelledBy: user?.id, reason: "Cancelled from Purchases page" }),
      }),
    onSuccess: () => {
      setActionError("");
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const receiveMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/purchases/${receiptOrder?.id}/receive`, {
        method: "POST",
        token: accessToken ?? undefined,
        body: JSON.stringify({
          receivedBy: user?.id,
          receivedItems: Object.entries(receiptQty)
            .filter(([, quantity]) => quantity > 0)
            .map(([purchaseOrderItemId, quantity]) => ({ purchaseOrderItemId, quantity })),
        }),
      }),
    onSuccess: () => {
      setActionError("");
      setReceiptOrder(null);
      setReceiptQty({});
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
      qc.invalidateQueries({ queryKey: ["inventory-movements"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const orders = data?.purchaseOrders ?? [];
  const vendors = vendorsData?.vendors ?? [];
  const products = productsData?.products ?? [];

  function closeCreate() {
    setShowCreate(false);
    setCreateError("");
    setForm({ vendorId: "", orderDate: todayInputValue(), expectedDate: "", notes: "", items: [{ ...EMPTY_LINE }] });
  }

  function updateLine(index: number, patch: Partial<LineForm>) {
    setForm((current) => ({
      ...current,
      items: current.items.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    }));
  }

  function selectProduct(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    updateLine(index, { productId, unitCost: product?.standardCost ?? 0 });
  }

  function removeLine(index: number) {
    setForm((current) => {
      const items = current.items.filter((_, i) => i !== index);
      return { ...current, items: items.length > 0 ? items : [{ ...EMPTY_LINE }] };
    });
  }

  function openReceipt(order: PurchaseOrder) {
    const initial = Object.fromEntries(
      order.items
        .filter((item) => item.quantity - item.receivedQty > 0)
        .map((item) => [item.id, item.quantity - item.receivedQty]),
    );
    setActionError("");
    setReceiptQty(initial);
    setReceiptOrder(order);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-elevated">
        <div>
          <h1 className="text-lg font-semibold text-text-1">Purchase Orders</h1>
          <p className="text-xs text-text-3 mt-0.5">{orders.length} orders</p>
        </div>
        {canWrite && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
          >
            <Plus size={16} /> New Purchase Order
          </button>
        )}
      </div>

      {actionError && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-xs text-red-700">{actionError}</div>
      )}

      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-text-3 text-sm">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-text-3 text-sm">No purchase orders found</div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {["Order", "Vendor", "Status", "Order Date", "Items", "Total", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-text-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 bg-bg hover:bg-surface transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-text-2">{order.orderNumber}</td>
                    <td className="px-4 py-3 font-medium text-text-1">{order.vendor?.name ?? order.vendorId}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_CLASSES[order.status]}`}>
                        {order.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-2 whitespace-nowrap">
                      {new Date(order.orderDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-text-2">{order.items.length}</td>
                    <td className="px-4 py-3 font-semibold text-text-1 tabular-nums">{currency(order.totalValue)}</td>
                    <td className="px-4 py-3">
                      {canWrite && (
                        <div className="flex items-center justify-end gap-2">
                          {order.status === "DRAFT" && (
                            <IconButton label="Confirm" onClick={() => confirmMutation.mutate(order.id)} disabled={!user?.id || confirmMutation.isPending}>
                              <Check size={15} />
                            </IconButton>
                          )}
                          {["CONFIRMED", "PARTIALLY_RECEIVED"].includes(order.status) && (
                            <IconButton label="Receive" onClick={() => openReceipt(order)}>
                              <PackageCheck size={15} />
                            </IconButton>
                          )}
                          {["DRAFT", "CONFIRMED"].includes(order.status) && (
                            <IconButton label="Cancel" onClick={() => cancelMutation.mutate(order.id)} disabled={!user?.id || cancelMutation.isPending}>
                              <X size={15} />
                            </IconButton>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <Modal title="New Purchase Order" onClose={closeCreate}>
          {createError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{createError}</p>}

          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Vendor" value={form.vendorId} onChange={(v) => setForm((f) => ({ ...f, vendorId: v }))}>
              <option value="">Select vendor</option>
              {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
            </SelectField>
            <Field label="Order Date" type="date" value={form.orderDate} onChange={(v) => setForm((f) => ({ ...f, orderDate: v }))} />
            <Field label="Expected Date" type="date" value={form.expectedDate} onChange={(v) => setForm((f) => ({ ...f, expectedDate: v }))} />
            <Field label="Notes" value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-text-2 uppercase tracking-wide">Items</p>
              <button
                onClick={() => setForm((f) => ({ ...f, items: [...f.items, { ...EMPTY_LINE }] }))}
                className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
              >
                <Plus size={14} /> Add line
              </button>
            </div>
            {form.items.map((line, index) => (
              <div key={index} className="grid grid-cols-[1fr_5rem_7rem_2rem] gap-2 items-end">
                <SelectField label="Product" value={line.productId} onChange={(v) => selectProduct(index, v)}>
                  <option value="">Select product</option>
                  {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
                </SelectField>
                <Field label="Qty" type="number" value={String(line.quantity)} onChange={(v) => updateLine(index, { quantity: Number(v) })} />
                <Field label="Unit Cost" type="number" value={String(line.unitCost)} onChange={(v) => updateLine(index, { unitCost: Number(v) })} />
                <button
                  onClick={() => removeLine(index)}
                  className="h-8 w-8 rounded-lg text-text-3 hover:text-red-600 hover:bg-red-50 inline-flex items-center justify-center"
                  aria-label="Remove line"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <ModalActions
            onCancel={closeCreate}
            onSubmit={() => createMutation.mutate()}
            disabled={createMutation.isPending || !form.vendorId || form.items.some((line) => !line.productId)}
            submitLabel={createMutation.isPending ? "Creating..." : "Create"}
          />
        </Modal>
      )}

      {receiptOrder && (
        <Modal title={`Receive ${receiptOrder.orderNumber}`} onClose={() => setReceiptOrder(null)}>
          {actionError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{actionError}</p>}
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {["Product", "Ordered", "Received", "Receive"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-medium text-text-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {receiptOrder.items.map((item) => {
                  const remaining = item.quantity - item.receivedQty;
                  return (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-text-1">{item.product?.name ?? item.productId}</td>
                      <td className="px-3 py-2 text-text-2">{item.quantity}</td>
                      <td className="px-3 py-2 text-text-2">{item.receivedQty}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          max={remaining}
                          value={receiptQty[item.id] ?? 0}
                          onChange={(e) => setReceiptQty((q) => ({ ...q, [item.id]: Math.min(remaining, Number(e.target.value)) }))}
                          disabled={remaining === 0}
                          className="w-24 px-2 py-1 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ModalActions
            onCancel={() => setReceiptOrder(null)}
            onSubmit={() => receiveMutation.mutate()}
            disabled={receiveMutation.isPending || !user?.id || Object.values(receiptQty).every((qty) => qty <= 0)}
            submitLabel={receiveMutation.isPending ? "Receiving..." : "Receive"}
          />
        </Modal>
      )}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="h-8 w-8 rounded-lg border border-border text-text-2 hover:text-accent hover:bg-accent-light inline-flex items-center justify-center transition-colors disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-bg rounded-2xl border border-border shadow-xl w-full max-w-3xl mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-1">{title}</h2>
          <button onClick={onClose} className="text-text-3 hover:text-text-1 text-lg leading-none" aria-label="Close">x</button>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  onSubmit,
  disabled,
  submitLabel,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  disabled?: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2 border-t border-border">
      <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-text-2 hover:bg-surface transition-colors">
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label className="text-xs font-medium text-text-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent min-w-0"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label className="text-xs font-medium text-text-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent min-w-0"
      >
        {children}
      </select>
    </div>
  );
}
