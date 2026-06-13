"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Phone, UserRound } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { useAppStore } from "../../../store/app-store";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface CustomersResponse {
  data: { customers: Customer[]; total: number };
}

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
};

export default function CustomersPage() {
  const { accessToken, user } = useAppStore();
  const queryClient = useQueryClient();
  const canWrite = user?.role === "ADMIN" || user?.role === "SALES_USER" || user?.role === "BUSINESS_OWNER";

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | Customer | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const params = new URLSearchParams();
  if (search) params.set("name", search);

  const { data, isLoading } = useQuery<CustomersResponse["data"]>({
    queryKey: ["customers", search],
    queryFn: async () => {
      const response = await apiFetch<CustomersResponse>(`/customers?${params}`, {
        token: accessToken ?? undefined,
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof EMPTY_FORM) =>
      apiFetch("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: body.name,
          email: body.email || undefined,
          phone: body.phone || undefined,
        }),
        token: accessToken ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      closeModal();
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: typeof EMPTY_FORM }) =>
      apiFetch(`/customers/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: body.name,
          email: body.email || undefined,
          phone: body.phone || undefined,
        }),
        token: accessToken ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      closeModal();
    },
    onError: (err: Error) => setError(err.message),
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setError("");
    setModal("create");
  }

  function openEdit(customer: Customer) {
    setForm({
      name: customer.name,
      email: customer.email ?? "",
      phone: customer.phone ?? "",
    });
    setError("");
    setModal(customer);
  }

  function closeModal() {
    setModal(null);
    setError("");
  }

  function submit() {
    if (!form.name.trim()) {
      setError("Customer name is required");
      return;
    }

    if (modal === "create") {
      createMutation.mutate(form);
      return;
    }

    if (modal && typeof modal === "object") {
      updateMutation.mutate({ id: modal.id, body: form });
    }
  }

  const customers = data?.customers ?? [];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-elevated px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-text-1">Customers</h1>
          <p className="mt-0.5 text-xs text-text-3">{data?.total ?? 0} customers</p>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            + New Customer
          </button>
        )}
      </div>

      <div className="border-b border-border bg-surface px-6 py-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search customers..."
          className="w-64 rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-text-3">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg text-center">
            <UserRound size={28} className="text-text-3" />
            <p className="mt-3 text-sm font-medium text-text-1">No customers yet</p>
            <p className="mt-1 text-xs text-text-3">Create customers before making sales orders.</p>
            {canWrite && (
              <button onClick={openCreate} className="mt-4 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover">
                Create customer
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  {["Customer", "Email", "Phone", ""].map((heading) => (
                    <th key={heading} className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium text-text-3">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border bg-bg last:border-0 hover:bg-surface">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-light text-accent">
                          <UserRound size={15} />
                        </div>
                        <div>
                          <p className="font-medium text-text-1">{customer.name}</p>
                          <p className="font-mono text-[11px] text-text-3">{customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-2">
                      {customer.email ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Mail size={14} />
                          {customer.email}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 text-text-2">
                      {customer.phone ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone size={14} />
                          {customer.phone}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canWrite && (
                        <button onClick={() => openEdit(customer)} className="text-xs text-accent hover:underline">
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl border border-border bg-bg shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-text-1">
                {modal === "create" ? "New Customer" : `Edit ${(modal as Customer).name}`}
              </h2>
              <button onClick={closeModal} className="text-lg leading-none text-text-3 hover:text-text-1">
                x
              </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto px-5 py-4">
              {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
              <CustomerField label="Name *" value={form.name} onChange={(value) => setForm((f) => ({ ...f, name: value }))} />
              <CustomerField label="Email" type="email" value={form.email} onChange={(value) => setForm((f) => ({ ...f, email: value }))} />
              <CustomerField label="Phone" value={form.phone} onChange={(value) => setForm((f) => ({ ...f, phone: value }))} />
            </div>

            <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
              <button onClick={closeModal} className="rounded-lg px-4 py-2 text-sm text-text-2 transition-colors hover:bg-surface">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={isSubmitting}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : modal === "create" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}
