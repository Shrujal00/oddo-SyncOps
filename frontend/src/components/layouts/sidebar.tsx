"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  Building2,
  ClipboardList,
  Factory,
  Gauge,
  History,
  LogOut,
  Package,
  PackageCheck,
  ShoppingCart,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { BrandLogo } from "../brand/logo";
import { useAppStore } from "../../store/app-store";

const NAV = [
  { label: "Overview", href: "/overview", icon: Gauge, roles: ["*"] },
  { label: "Products", href: "/products", icon: Package, roles: ["*"] },
  { label: "Sales", href: "/sales", icon: ShoppingCart, roles: ["ADMIN", "SALES_USER", "INVENTORY_MANAGER", "BUSINESS_OWNER"] },
  { label: "Customers", href: "/customers", icon: UserRound, roles: ["ADMIN", "SALES_USER", "BUSINESS_OWNER"] },
  { label: "Purchases", href: "/purchases", icon: PackageCheck, roles: ["ADMIN", "PURCHASE_USER", "INVENTORY_MANAGER", "BUSINESS_OWNER"] },
  { label: "Vendors", href: "/vendors", icon: Building2, roles: ["ADMIN", "PURCHASE_USER", "BUSINESS_OWNER"] },
  { label: "Manufacturing", href: "/manufacturing", icon: Factory, roles: ["ADMIN", "MANUFACTURING_USER", "BUSINESS_OWNER"] },
  { label: "Bill of Materials", href: "/bill-of-materials", icon: ClipboardList, roles: ["ADMIN", "MANUFACTURING_USER", "BUSINESS_OWNER"] },
  { label: "Inventory", href: "/inventory", icon: Boxes, roles: ["ADMIN", "INVENTORY_MANAGER", "BUSINESS_OWNER"] },
  { label: "Procurement", href: "/procurement", icon: Wrench, roles: ["ADMIN", "INVENTORY_MANAGER"] },
  { label: "Audit", href: "/audit", icon: History, roles: ["ADMIN", "BUSINESS_OWNER"] },
  { label: "Users", href: "/users", icon: Users, roles: ["ADMIN"] },
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
  const visible = NAV.filter((item) => item.roles.includes("*") || item.roles.includes(role));

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-screen bg-elevated border-r border-border sticky top-0">
      <div className="flex items-center px-4 py-4 border-b border-border">
        <BrandLogo className="h-9 w-[150px]" />
      </div>

      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-accent-light text-accent"
                  : "text-text-2 hover:text-text-1 hover:bg-surface"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-border">
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-1.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-accent-light flex items-center justify-center text-xs font-semibold text-accent shrink-0">
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
          className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-2 hover:text-text-1 hover:bg-surface transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
