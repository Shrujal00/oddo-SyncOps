"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "../../store/app-store";

const NAV = [
  { label: "Overview",      href: "/overview",      icon: "⊞", roles: ["*"] },
  { label: "Products",      href: "/erp/products",  icon: "◈", roles: ["*"] },
  { label: "Sales",         href: "/erp/sales",     icon: "↗", roles: ["ADMIN","SALES_USER","INVENTORY_MANAGER","BUSINESS_OWNER"] },
  { label: "Purchases",     href: "/erp/purchases", icon: "↙", roles: ["ADMIN","PURCHASE_USER","INVENTORY_MANAGER","BUSINESS_OWNER"] },
  { label: "Manufacturing", href: "/erp/manufacturing", icon: "⚙", roles: ["ADMIN","MANUFACTURING_USER","BUSINESS_OWNER"] },
  { label: "Bill of Materials", href: "/erp/bill-of-materials", icon: "≡", roles: ["ADMIN","MANUFACTURING_USER","BUSINESS_OWNER"] },
  { label: "Inventory",     href: "/erp/inventory",  icon: "▤", roles: ["ADMIN","INVENTORY_MANAGER","BUSINESS_OWNER"] },
  { label: "Procurement",   href: "/erp/procurement",icon: "⟳", roles: ["ADMIN","INVENTORY_MANAGER"] },
  { label: "Audit",         href: "/erp/audit",      icon: "◎", roles: ["ADMIN","BUSINESS_OWNER"] },
  { label: "Users",         href: "/erp/users",      icon: "◉", roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAppStore();

  function logout() {
    clearAuth();
    document.cookie = "syncops-token=; path=/; max-age=0";
    router.push("/login");
  }

  const role = user?.role ?? "";

  const visible = NAV.filter((item) =>
    item.roles.includes("*") || item.roles.includes(role)
  );

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-screen bg-surface border-r border-[rgb(var(--border))] sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[rgb(var(--border))]">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M3 10L10 3L17 10M5 8V17H15V8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-sm font-semibold text-text-1">SyncOps</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-text-2 hover:text-text-1 hover:bg-elevated"
              }`}
            >
              <span className="text-base leading-none w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-[rgb(var(--border))]">
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-1.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-elevated flex items-center justify-center text-xs font-semibold text-text-2 shrink-0">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-1 truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-text-3 truncate">{user.role.replace(/_/g, " ")}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-text-2 hover:text-text-1 hover:bg-elevated transition-colors"
        >
          <span className="text-base leading-none w-4 text-center">→</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
