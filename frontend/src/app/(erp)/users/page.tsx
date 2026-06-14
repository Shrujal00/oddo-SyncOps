"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, KeyRound, Pencil, Save, ShieldCheck, Trash2, UserRound, X } from "lucide-react";
import { apiFetch } from "../../../lib/api";
import { useAppStore } from "../../../store/app-store";

type RoleName = "ADMIN" | "SALES_USER" | "PURCHASE_USER" | "MANUFACTURING_USER" | "INVENTORY_MANAGER" | "BUSINESS_OWNER";

interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleName;
  roleLabel: string;
  isActive: boolean;
}

interface RolePermission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
}

interface RoleRecord {
  name: RoleName;
  label: string;
  description: string;
  permissions: RolePermission[];
}

interface UsersResponse { data: UserRecord[] }
interface RolesResponse { data: RoleRecord[] }

const EMPTY_FORM = {
  email: "",
  firstName: "",
  lastName: "",
  roleName: "SALES_USER" as RoleName,
  password: "",
  isActive: true,
};

const ACTIONS: Array<keyof Omit<RolePermission, "module">> = ["view", "create", "edit", "delete", "approve"];

function roleTone(role: RoleName) {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-700";
    case "BUSINESS_OWNER":
      return "bg-purple-100 text-purple-700";
    case "SALES_USER":
      return "bg-blue-100 text-blue-700";
    case "PURCHASE_USER":
      return "bg-emerald-100 text-emerald-700";
    case "MANUFACTURING_USER":
      return "bg-orange-100 text-orange-700";
    case "INVENTORY_MANAGER":
      return "bg-slate-100 text-slate-700";
  }
}

export default function UsersPage() {
  const { accessToken, user: currentUser } = useAppStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleName | "ALL">("ALL");
  const [panelRole, setPanelRole] = useState<RoleName>("ADMIN");
  const [modal, setModal] = useState<"create" | UserRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [roleDraft, setRoleDraft] = useState<RolePermission[]>([]);

  const { data: users = [], isLoading } = useQuery<UserRecord[]>({
    queryKey: ["users"],
    queryFn: async () => (await apiFetch<UsersResponse>("/users", { token: accessToken ?? undefined })).data,
  });

  const { data: roles = [] } = useQuery<RoleRecord[]>({
    queryKey: ["roles"],
    queryFn: async () => (await apiFetch<RolesResponse>("/users/roles", { token: accessToken ?? undefined })).data,
  });

  const selectedRoleRecord = roles.find((role) => role.name === panelRole) ?? roles[0];

  useEffect(() => {
    if (roles.length > 0 && !roles.find((r) => r.name === panelRole)) {
      setPanelRole(roles[0].name);
    }
  }, [roles]);

  useEffect(() => {
    if (!selectedRoleRecord) return;
    setRoleDescription(selectedRoleRecord.description);
    setRoleDraft(selectedRoleRecord.permissions.map((permission) => ({ ...permission })));
  }, [selectedRoleRecord]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((record) => {
      const matchesSearch = !q ||
        record.email.toLowerCase().includes(q) ||
        record.firstName.toLowerCase().includes(q) ||
        record.lastName.toLowerCase().includes(q);
      const matchesRole = selectedRole === "ALL" || record.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [search, selectedRole, users]);

  const createMutation = useMutation({
    mutationFn: () => apiFetch("/users", {
      method: "POST",
      token: accessToken ?? undefined,
      body: JSON.stringify({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        roleName: form.roleName,
        password: form.password || undefined,
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closeModal();
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => apiFetch(`/users/${id}`, {
      method: "PATCH",
      token: accessToken ?? undefined,
      body: JSON.stringify({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        roleName: form.roleName,
        isActive: form.isActive,
        password: form.password || undefined,
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closeModal();
    },
    onError: (err: Error) => setError(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => apiFetch(`/users/${id}/${active ? "activate" : "deactivate"}`, {
      method: "POST",
      token: accessToken ?? undefined,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/users/${id}`, {
      method: "DELETE",
      token: accessToken ?? undefined,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (err: Error) => setError(err.message),
  });

  const updateRoleMutation = useMutation({
    mutationFn: () => apiFetch(`/users/roles/${selectedRoleRecord?.name}`, {
      method: "PATCH",
      token: accessToken ?? undefined,
      body: JSON.stringify({
        description: roleDescription,
        permissions: roleDraft,
      }),
    }),
    onSuccess: () => {
      setError("");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  function openCreate() {
    setForm({ ...EMPTY_FORM, password: "Welcome@123" });
    setError("");
    setModal("create");
  }

  function openCreateAdmin() {
    setForm({ ...EMPTY_FORM, roleName: "ADMIN", password: "Admin@1234" });
    setError("");
    setModal("create");
  }

  function openEdit(record: UserRecord) {
    setForm({
      email: record.email,
      firstName: record.firstName,
      lastName: record.lastName,
      roleName: record.role,
      password: "",
      isActive: record.isActive,
    });
    setError("");
    setModal(record);
  }

  function closeModal() {
    setModal(null);
    setError("");
  }

  function submit() {
    if (!form.email || !form.firstName || !form.lastName) {
      setError("Email, first name, and last name are required");
      return;
    }
    if (modal === "create") {
      createMutation.mutate();
      return;
    }
    if (modal && typeof modal === "object") {
      updateMutation.mutate({ id: modal.id });
    }
  }

  function togglePermission(module: string, action: keyof Omit<RolePermission, "module">) {
    setRoleDraft((current) => current.map((permission) => {
      if (permission.module !== module) return permission;
      return { ...permission, [action]: !permission[action] };
    }));
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-elevated px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-text-1">User Management</h1>
          <p className="mt-0.5 text-xs text-text-3">{users.length} users · role based access</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openCreateAdmin} className="rounded-lg border border-border bg-bg px-3 py-1.5 text-sm font-medium text-text-1 hover:bg-surface">
            + New Admin
          </button>
          <button onClick={openCreate} className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover">
            + New User
          </button>
        </div>
      </div>

      {error && <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-xs text-red-700">{error}</div>}

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_420px] overflow-hidden">
        <section className="min-w-0 overflow-auto px-6 py-4">
          <div className="mb-4 flex items-center gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users..."
              className="w-64 rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <select
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value as RoleName | "ALL")}
              className="rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="ALL">All roles</option>
              {roles.map((role) => <option key={role.name} value={role.name}>{role.label}</option>)}
            </select>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-sm text-text-3">Loading...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg text-center">
              <UserRound size={28} className="text-text-3" />
              <p className="mt-3 text-sm font-medium text-text-1">No users found</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredUsers.map((record) => {
                const isCurrent = record.id === currentUser?.id;
                return (
                  <div key={record.id} className="rounded-xl border border-border bg-bg p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-light text-sm font-semibold text-accent">
                          {record.firstName[0]}{record.lastName[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-semibold text-text-1">{record.firstName} {record.lastName}</h2>
                            {isCurrent && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">YOU</span>}
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${roleTone(record.role)}`}>{record.roleLabel}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${record.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                              {record.isActive ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-text-2">{record.email}</p>
                          <p className="mt-1 font-mono text-[11px] text-text-3">{record.id}</p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <IconButton label="Edit user" onClick={() => openEdit(record)}>
                          <Pencil size={15} />
                        </IconButton>
                        {!isCurrent && (
                          <IconButton
                            label={record.isActive ? "Deactivate user" : "Activate user"}
                            onClick={() => statusMutation.mutate({ id: record.id, active: !record.isActive })}
                          >
                            {record.isActive ? <X size={15} /> : <Check size={15} />}
                          </IconButton>
                        )}
                        {!isCurrent && (
                          <IconButton label="Delete user" danger onClick={() => deleteMutation.mutate(record.id)}>
                            <Trash2 size={15} />
                          </IconButton>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="overflow-auto border-l border-border bg-surface px-5 py-4">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-accent" />
            <div>
              <h2 className="text-sm font-semibold text-text-1">Role Permissions</h2>
              <p className="text-xs text-text-3">Access is role-based</p>
            </div>
          </div>

          <select
            value={panelRole}
            onChange={(event) => setPanelRole(event.target.value as RoleName)}
            className="mb-3 w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {roles.map((role) => <option key={role.name} value={role.name}>{role.label}</option>)}
          </select>

          {selectedRoleRecord && (
            <>
              <div className="mb-3 rounded-lg border border-border bg-bg p-3">
                <label className="text-xs font-medium text-text-2">Role description</label>
                <textarea
                  value={roleDescription}
                  onChange={(event) => setRoleDescription(event.target.value)}
                  className="mt-1 h-16 w-full resize-none rounded-lg border border-border bg-bg px-2 py-1.5 text-xs leading-5 text-text-1 focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => updateRoleMutation.mutate()}
                  disabled={updateRoleMutation.isPending || !selectedRoleRecord}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover disabled:opacity-50"
                >
                  <Save size={13} />
                  {updateRoleMutation.isPending ? "Saving..." : "Save role"}
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-border bg-bg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-elevated">
                      <th className="px-3 py-2 text-left font-medium text-text-3">Module</th>
                      {ACTIONS.map((action) => (
                        <th key={action} className="px-2 py-2 text-center font-medium capitalize text-text-3">{action}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roleDraft.map((permission) => (
                      <tr key={permission.module} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 font-medium text-text-1">{permission.module}</td>
                        {ACTIONS.map((action) => (
                          <td key={action} className="px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => togglePermission(permission.module, action)}
                              className="mx-auto flex h-6 w-6 items-center justify-center rounded-md hover:bg-surface"
                              title={`Toggle ${action} for ${permission.module}`}
                            >
                              {permission[action] ? (
                                <Check size={14} className="text-emerald-600" />
                              ) : (
                                <X size={14} className="text-text-3" />
                              )}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </aside>
      </div>

      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-bg shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-text-1">
                {modal === "create" ? "New User" : `Edit ${(modal as UserRecord).firstName} ${(modal as UserRecord).lastName}`}
              </h2>
              <button onClick={closeModal} className="text-lg leading-none text-text-3 hover:text-text-1">x</button>
            </div>

            <div className="grid gap-4 overflow-y-auto px-5 py-4 md:grid-cols-[1fr_1fr]">
              <div className="flex flex-col gap-3">
                {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
                <Field label="Email *" type="email" value={form.email} onChange={(value) => setForm((f) => ({ ...f, email: value }))} />
                <Field label="First Name *" value={form.firstName} onChange={(value) => setForm((f) => ({ ...f, firstName: value }))} />
                <Field label="Last Name *" value={form.lastName} onChange={(value) => setForm((f) => ({ ...f, lastName: value }))} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-2">Role</label>
                  <select
                    value={form.roleName}
                    onChange={(event) => setForm((f) => ({ ...f, roleName: event.target.value as RoleName }))}
                    className="rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-text-1 focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {roles.map((role) => <option key={role.name} value={role.name}>{role.label}</option>)}
                  </select>
                </div>
                <Field
                  label={modal === "create" ? "Temporary Password" : "Reset Password"}
                  type="text"
                  value={form.password}
                  onChange={(value) => setForm((f) => ({ ...f, password: value }))}
                />
                {modal !== "create" && (
                  <label className="flex items-center gap-2 text-sm text-text-2">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) => setForm((f) => ({ ...f, isActive: event.target.checked }))}
                      className="accent-[#714B67]"
                    />
                    Active user
                  </label>
                )}
              </div>

              <div className="rounded-xl border border-border bg-surface p-3">
                <div className="mb-2 flex items-center gap-2">
                  <KeyRound size={16} className="text-accent" />
                  <p className="text-sm font-semibold text-text-1">Assigned Access</p>
                </div>
                <p className="mb-3 text-xs leading-5 text-text-3">
                  Changing the role changes the modules and actions available after the next login.
                </p>
                <div className="max-h-72 overflow-auto rounded-lg border border-border bg-bg">
                  <table className="w-full text-xs">
                    <tbody>
                      {(roles.find((role) => role.name === form.roleName)?.permissions ?? []).map((permission) => (
                        <tr key={permission.module} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 font-medium text-text-1">{permission.module}</td>
                          <td className="px-3 py-2 text-right text-text-2">
                            {ACTIONS.filter((action) => permission[action]).join(", ") || "No access"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
              <button onClick={closeModal} className="rounded-lg px-4 py-2 text-sm text-text-2 hover:bg-surface">Cancel</button>
              <button
                onClick={submit}
                disabled={isSubmitting}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : modal === "create" ? "Create User" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
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

function IconButton({
  label,
  onClick,
  children,
  danger,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors ${
        danger
          ? "text-text-2 hover:bg-red-50 hover:text-red-600"
          : "text-text-2 hover:bg-accent-light hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}
