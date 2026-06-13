export const ROLE_NAMES = [
  "Admin",
  "Sales User",
  "Purchase User",
  "Manufacturing User",
  "Inventory Manager",
  "Business Owner",
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

export const PERMISSIONS = {
  usersManage: "users:manage",
  productsRead: "products:read",
  productsManage: "products:manage",
  inventoryManage: "inventory:manage",
  salesManage: "sales:manage",
  purchasesManage: "purchases:manage",
  manufacturingManage: "manufacturing:manage",
  procurementManage: "procurement:manage",
  auditRead: "audit:read",
  dashboardRead: "dashboard:read",
} as const;
