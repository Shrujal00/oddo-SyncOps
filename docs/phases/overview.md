# SyncOps — Phase Overview

Last updated: 2026-06-13

## Status Legend
`DONE` · `IN_PROGRESS` · `TODO` · `BLOCKED`

## Phase Summary

| Phase | Name | Owner | Status | Depends On |
|-------|------|-------|--------|------------|
| [01](./phase-01-scaffold.md) | Scaffold & Schema | Shrujal + Teesha | **DONE** | — |
| [02](./phase-02-auth.md) | Auth & Infrastructure | Teesha | **TODO** | 01 |
| [03](./phase-03-core-data.md) | Products & Inventory | Teesha + Shrujal | **TODO** | 02 |
| [04](./phase-04-transactions.md) | Sales & Purchases | Teesha + Shrujal | **TODO** | 03 |
| [05](./phase-05-manufacturing.md) | Manufacturing & BoM | Teesha + Shrujal | **TODO** | 03 |
| [06](./phase-06-procurement.md) | Procurement Automation | Teesha | **TODO** | 04 + 05 |
| [07](./phase-07-audit-dashboard.md) | Audit & Dashboard | Teesha + Shrujal | **TODO** | 04 + 05 |
| [08](./phase-08-frontend.md) | Frontend Polish | Shrujal | **TODO** | 03–07 |
| [09](./phase-09-integration.md) | Integration & Deploy | Shrujal + Teesha | **TODO** | 08 |

## Critical Path

```
Scaffold → Auth → Products+Inventory → Sales+Purchases
                                    ↘ Manufacturing+BoM
                                           ↘ Procurement Automation
                                                  ↘ Audit+Dashboard → Frontend Polish → Deploy
```

## What Each Phase Delivers

**Phase 01** — Complete project scaffold: Prisma schema, all backend module stubs, all frontend route placeholders, docs.

**Phase 02** — Working auth: login, register, JWT, RBAC guard, DB seed with all roles + admin user.

**Phase 03** — Products CRUD with computed stock quantities. Inventory movement write helper. Products frontend page.

**Phase 04** — Sales orders (create → confirm → deliver) and Purchase orders (create → confirm → receive). Stock changes on each action. Pages wired.

**Phase 05** — BoM CRUD, WorkCenter CRUD, Manufacturing orders (create → confirm → start → complete). Component consumption on complete. Pages wired.

**Phase 06** — Procurement engine: sales order confirm auto-creates PO or MO based on product config when stock is short.

**Phase 07** — Audit log writes wired to all status transitions. Dashboard stats endpoint. Both pages functional.

**Phase 08** — All frontend tables, forms, modals, RBAC-aware nav, auth guard middleware. Full UI for every module.

**Phase 09** — Seed data (products, vendors, customers, BoMs, users), end-to-end flow test, Docker Compose bring-up, final QA.
