import { Router } from "express";
import { authRoutes } from "../modules/auth/index.js";
import { assistantRoutes } from "../modules/assistant/index.js";
import { auditRoutes } from "../modules/audit/index.js";
import { billOfMaterialsRoutes } from "../modules/bill-of-materials/index.js";
import { customersRoutes } from "../modules/customers/index.js";
import { dashboardRoutes } from "../modules/dashboard/index.js";
import { inventoryRoutes } from "../modules/inventory/index.js";
import { manufacturingRoutes } from "../modules/manufacturing/index.js";
import { procurementRoutes } from "../modules/procurement/index.js";
import { productsRoutes } from "../modules/products/index.js";
import { purchasesRoutes } from "../modules/purchases/index.js";
import { salesRoutes } from "../modules/sales/index.js";
import { usersRoutes } from "../modules/users/index.js";
import { vendorsRoutes } from "../modules/vendors/index.js";

export const apiRouter = Router();

apiRouter.get("/", (_request, response) => {
  response.json({
    service: "syncops-api",
    status: "ok",
    routes: [
      "/api/auth",
      "/api/assistant",
      "/api/products",
      "/api/sales",
      "/api/purchases",
      "/api/manufacturing",
      "/api/bom",
      "/api/inventory",
      "/api/procurement",
      "/api/audit",
      "/api/dashboard",
    ],
  });
});

apiRouter.use("/auth", authRoutes);
apiRouter.use("/assistant", assistantRoutes);
apiRouter.use("/audit", auditRoutes);
apiRouter.use("/audit-logs", auditRoutes);
apiRouter.use("/bill-of-materials", billOfMaterialsRoutes);
apiRouter.use("/bom", billOfMaterialsRoutes);
apiRouter.use("/customers", customersRoutes);
apiRouter.use("/dashboard", dashboardRoutes);
apiRouter.use("/inventory", inventoryRoutes);
apiRouter.use("/manufacturing", manufacturingRoutes);
apiRouter.use("/manufacturing-orders", manufacturingRoutes);
apiRouter.use("/procurement", procurementRoutes);
apiRouter.use("/products", productsRoutes);
apiRouter.use("/purchase-orders", purchasesRoutes);
apiRouter.use("/purchases", purchasesRoutes);
apiRouter.use("/sales-orders", salesRoutes);
apiRouter.use("/sales", salesRoutes);
apiRouter.use("/users", usersRoutes);
apiRouter.use("/vendors", vendorsRoutes);
