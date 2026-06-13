# Phase 01 — Scaffold & Schema

**Status:** DONE  
**Owner:** Shrujal00 (DB + frontend) · Teesha-Gokulgandhi (backend)  
**Branch:** master  

## Deliverables

- [x] Monorepo with npm workspaces (frontend + backend)
- [x] Prisma schema: all 15 models, all enums, all indexes, soft delete
- [x] Procurement config fields on Product (`procureOnDemand`, `procurementMode`, `supplyStrategy`, `preferredVendorId`, `activeBomId`)
- [x] WorkCenter model + `plannedDurationMins` on WorkOrder
- [x] Express app bootstrap (Helmet, CORS, error handler, health check)
- [x] All 10 backend modules scaffolded (controller / service / repository / routes / dto / types / validation)
- [x] All service methods stub with `notImplemented()`
- [x] JWT auth middleware + RBAC guard scaffolded
- [x] Next.js 15 App Router with all route groups: `(auth)`, `(dashboard)`, `(erp)`
- [x] All 10 ERP frontend pages as placeholders
- [x] Feature modules, API client, Zustand store, TanStack Query client
- [x] Docs: architecture, RBAC, workflow, DB schema, API spec
- [x] `.agent/` progress tracker with task specs for all modules
- [x] Local `.env.example`
- [x] 34 logical commits pushed to GitHub

## Key Decisions

- Stock quantities **not stored** on Product — computed from `InventoryMovement` ledger
- `freeToUseQty = onHandQty - reservedQty`
- Every stock change writes an `InventoryMovement`
- Every status transition writes an `AuditLog`
- Procurement triggers from `SalesService.confirm()`, not a separate HTTP call
