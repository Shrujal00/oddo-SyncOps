"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useAppStore } from "../../../store/app-store";
import { apiFetch } from "../../../lib/api";
import { Pagination } from "../../../components/Pagination";

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  productType: ProductType;
  unitOfMeasure: string;
  standardCost: number;
  sellingPrice: number;
  reorderPoint: number;
  procureOnDemand: boolean;
  procurementMode: "MTS" | "MTO";
  supplyStrategy: "BUY" | "MAKE";
  preferredVendorId?: string;
  activeBomId?: string;
  onHandQty: number;
  reservedQty: number;
  freeToUseQty: number;
}

type ProductType = "RAW_MATERIAL" | "FINISHED_PRODUCT";

interface ProductsResponse {
  data: { products: Product[]; total: number; page: number; limit: number };
}

const EMPTY_FORM = {
  sku: "",
  name: "",
  description: "",
  productType: "FINISHED_PRODUCT" as ProductType,
  unitOfMeasure: "pcs",
  standardCost: 0,
  sellingPrice: 0,
  reorderPoint: 0,
  procureOnDemand: false,
  procurementMode: "MTS" as "MTS" | "MTO",
  supplyStrategy: "BUY" as "BUY" | "MAKE",
  preferredVendorId: "",
  activeBomId: "",
};

const UNIT_OPTIONS = [
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "each", label: "Each" },
  { value: "box", label: "Box" },
  { value: "pack", label: "Pack" },
  { value: "set", label: "Set" },
  { value: "pair", label: "Pair" },
  { value: "dozen", label: "Dozen" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "mg", label: "Milligram (mg)" },
  { value: "tonne", label: "Tonne" },
  { value: "l", label: "Liter (L)" },
  { value: "ml", label: "Milliliter (mL)" },
  { value: "m", label: "Meter (m)" },
  { value: "cm", label: "Centimeter (cm)" },
  { value: "mm", label: "Millimeter (mm)" },
  { value: "sq_m", label: "Square meter (sq m)" },
  { value: "cu_m", label: "Cubic meter (cu m)" },
  { value: "roll", label: "Roll" },
];

const PRODUCT_TYPE_OPTIONS = [
  { value: "FINISHED_PRODUCT", label: "Finished Product" },
  { value: "RAW_MATERIAL", label: "Raw Material" },
];

function unitOptionsFor(value: string) {
  if (!value || UNIT_OPTIONS.some((option) => option.value === value)) {
    return UNIT_OPTIONS;
  }
  return [{ value, label: value }, ...UNIT_OPTIONS];
}

export default function ProductsPage() {
  const { accessToken, user } = useAppStore();
  const qc = useQueryClient();
  const canWrite = user?.role === "ADMIN" || user?.role === "BUSINESS_OWNER";

  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [productTypeFilter, setProductTypeFilter] = useState<"ALL" | ProductType>("ALL");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<null | "create" | Product>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const params = new URLSearchParams();
  if (search) params.set("name", search);
  if (lowStockOnly) params.set("lowStockOnly", "true");
  if (productTypeFilter !== "ALL") params.set("productType", productTypeFilter);
  params.set("page", String(page));
  params.set("limit", "20");

  useEffect(() => {
    setPage(1);
  }, [search, lowStockOnly, productTypeFilter]);

  const { data, isLoading } = useQuery<ProductsResponse["data"]>({
    queryKey: ["products", search, lowStockOnly, productTypeFilter, page],
    queryFn: async () => {
      const res = await apiFetch<ProductsResponse>(`/products?${params}`, { token: accessToken ?? undefined });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof EMPTY_FORM) =>
      apiFetch("/products", {
        method: "POST",
        body: JSON.stringify({
          ...body,
          preferredVendorId: body.preferredVendorId || undefined,
          activeBomId: body.activeBomId || undefined,
        }),
        token: accessToken ?? undefined,
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); closeModal(); },
    onError: (e: Error) => setError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: typeof EMPTY_FORM }) =>
      apiFetch(`/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...body,
          preferredVendorId: body.preferredVendorId || undefined,
          activeBomId: body.activeBomId || undefined,
        }),
        token: accessToken ?? undefined,
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); closeModal(); },
    onError: (e: Error) => setError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/products/${id}`, {
        method: "DELETE",
        token: accessToken ?? undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setError("");
    },
    onError: (e: Error) => setError(e.message),
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setError("");
    setModal("create");
  }

  function openEdit(p: Product) {
    setForm({
      sku: p.sku,
      name: p.name,
      description: p.description ?? "",
      productType: p.productType,
      unitOfMeasure: p.unitOfMeasure,
      standardCost: p.standardCost,
      sellingPrice: p.sellingPrice,
      reorderPoint: p.reorderPoint,
      procureOnDemand: p.procureOnDemand,
      procurementMode: p.procurementMode,
      supplyStrategy: p.supplyStrategy,
      preferredVendorId: p.preferredVendorId ?? "",
      activeBomId: p.activeBomId ?? "",
    });
    setError("");
    setModal(p);
  }

  function closeModal() {
    setModal(null);
    setError("");
  }

  function submit() {
    if (modal === "create") {
      createMutation.mutate(form);
    } else if (modal && typeof modal === "object") {
      updateMutation.mutate({ id: modal.id, body: form });
    }
  }

  function deleteProduct(product: Product) {
    const confirmed = window.confirm(`Delete product "${product.name}"?`);
    if (!confirmed) return;
    deleteMutation.mutate(product.id);
  }

  const products = data?.products ?? [];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-elevated">
        <div>
          <h1 className="text-lg font-semibold text-text-1">Products</h1>
          <p className="text-xs text-text-3 mt-0.5">{data?.total ?? 0} products</p>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
          >
            + New Product
          </button>
        )}
      </div>

      {/* Filters */}
      {error && !modal && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-xs text-red-700">{error}</div>
      )}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-surface">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-1 focus:ring-accent w-56"
        />
        <label className="flex items-center gap-2 text-sm text-text-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="accent-[#714B67]"
          />
          Low stock only
        </label>
        <select
          value={productTypeFilter}
          onChange={(e) => setProductTypeFilter(e.target.value as "ALL" | ProductType)}
          className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="ALL">All types</option>
          <option value="FINISHED_PRODUCT">Finished products</option>
          <option value="RAW_MATERIAL">Raw materials</option>
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-text-3 text-sm">Loading…</div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-text-3 text-sm">No products found</div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {["SKU", "Name", "Type", "Unit", "On Hand", "Reserved", "Free to Use", "Reorder Pt", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-text-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const lowStock = p.freeToUseQty < p.reorderPoint;
                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-border last:border-0 transition-colors ${
                        lowStock ? "bg-orange-50 hover:bg-orange-100" : "bg-bg hover:bg-surface"
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-text-2">{p.sku}</td>
                      <td className="px-4 py-3 font-medium text-text-1">
                        {p.name}
                        {lowStock && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-700">
                            LOW
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          p.productType === "RAW_MATERIAL"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {p.productType === "RAW_MATERIAL" ? "RAW" : "PRODUCT"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-2">{p.unitOfMeasure}</td>
                      <td className="px-4 py-3 text-text-1 font-medium">{p.onHandQty}</td>
                      <td className="px-4 py-3 text-text-2">{p.reservedQty}</td>
                      <td className={`px-4 py-3 font-semibold ${lowStock ? "text-orange-600" : "text-text-1"}`}>
                        {p.freeToUseQty}
                      </td>
                      <td className="px-4 py-3 text-text-2">{p.reorderPoint}</td>
                      <td className="px-4 py-3">
                        {canWrite && (
                          <div className="flex items-center justify-end gap-2">
                            <IconButton label="Edit product" onClick={() => openEdit(p)}>
                              <Pencil size={15} />
                            </IconButton>
                            <IconButton
                              label="Delete product"
                              onClick={() => deleteProduct(p)}
                              disabled={deleteMutation.isPending}
                              danger
                            >
                              <Trash2 size={15} />
                            </IconButton>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && <Pagination page={data.page} limit={data.limit} total={data.total} onChange={setPage} />}

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-bg rounded-2xl border border-border shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text-1">
                {modal === "create" ? "New Product" : `Edit — ${(modal as Product).name}`}
              </h2>
              <button onClick={closeModal} className="text-text-3 hover:text-text-1 text-lg leading-none">×</button>
            </div>

            <div className="overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="SKU *" value={form.sku} onChange={(v) => setForm((f) => ({ ...f, sku: v }))} />
                <Field label="Name *" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
                <SelectField
                  label="Product Type *"
                  value={form.productType}
                  options={PRODUCT_TYPE_OPTIONS}
                  onChange={(v) => setForm((f) => ({ ...f, productType: v as ProductType }))}
                />
                <SelectField
                  label="Unit of Measure *"
                  value={form.unitOfMeasure}
                  options={unitOptionsFor(form.unitOfMeasure)}
                  onChange={(v) => setForm((f) => ({ ...f, unitOfMeasure: v }))}
                />
                <Field label="Reorder Point" type="number" value={String(form.reorderPoint)} onChange={(v) => setForm((f) => ({ ...f, reorderPoint: Number(v) }))} />
                <Field label="Standard Cost" type="number" value={String(form.standardCost)} onChange={(v) => setForm((f) => ({ ...f, standardCost: Number(v) }))} />
                <Field label="Selling Price" type="number" value={String(form.sellingPrice)} onChange={(v) => setForm((f) => ({ ...f, sellingPrice: Number(v) }))} />
              </div>

              <Field label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />

              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Procurement Mode"
                  value={form.procurementMode}
                  options={[{ value: "MTS", label: "Make to Stock" }, { value: "MTO", label: "Make to Order" }]}
                  onChange={(v) => setForm((f) => ({ ...f, procurementMode: v as "MTS" | "MTO" }))}
                />
                <SelectField
                  label="Supply Strategy"
                  value={form.supplyStrategy}
                  options={[{ value: "BUY", label: "Buy" }, { value: "MAKE", label: "Make" }]}
                  onChange={(v) => setForm((f) => ({ ...f, supplyStrategy: v as "BUY" | "MAKE" }))}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-text-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.procureOnDemand}
                  onChange={(e) => setForm((f) => ({ ...f, procureOnDemand: e.target.checked }))}
                  className="accent-[#714B67]"
                />
                Procure on Demand
              </label>

              <Field label="Preferred Vendor ID (UUID)" value={form.preferredVendorId} onChange={(v) => setForm((f) => ({ ...f, preferredVendorId: v }))} />
              <Field label="Active BOM ID (UUID)" value={form.activeBomId} onChange={(v) => setForm((f) => ({ ...f, activeBomId: v }))} />
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t border-border">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-sm text-text-2 hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving…" : modal === "create" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}

function SelectField({
  label, value, options, onChange,
}: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  disabled,
  danger,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors disabled:opacity-50 ${
        danger
          ? "text-text-2 hover:bg-red-50 hover:text-red-600"
          : "text-text-2 hover:bg-accent-light hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}
