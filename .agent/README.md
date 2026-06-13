# Agent Progress Tracker

This folder is the source of truth for implementation progress.
AI agents and humans: **read this before touching any code.**

## How to use

- Each file = one module or cross-cutting concern.
- Every task has a status: `TODO` | `IN_PROGRESS` | `DONE`.
- When you pick up a task, change status to `IN_PROGRESS` and note what file you're editing.
- When done, change to `DONE` and add a one-line summary of what was implemented.

## Module Files

| File | Covers | Status |
|------|--------|--------|
| [00-infrastructure.md](./00-infrastructure.md) | Auth, RBAC guard, seed, design system, app shell | **DONE** |
| [01-products.md](./01-products.md) | Product CRUD + stock qty compute | TODO |
| [02-inventory.md](./02-inventory.md) | InventoryMovement ledger | TODO |
| [03-sales.md](./03-sales.md) | Sales orders, confirm, deliver | TODO |
| [04-purchases.md](./04-purchases.md) | Purchase orders, receive | TODO |
| [05-manufacturing.md](./05-manufacturing.md) | MO, Work Orders, BoM, WorkCenter | TODO |
| [06-procurement.md](./06-procurement.md) | MTS/MTO automation trigger | TODO |
| [07-audit.md](./07-audit.md) | Audit log writes + query | TODO |
| [08-dashboard.md](./08-dashboard.md) | Aggregated stats queries | TODO |
| [09-frontend.md](./09-frontend.md) | Frontend pages + API wiring | TODO |

## What's Running

- Backend: `http://localhost:4000` (Express + Prisma)
- Frontend: `http://localhost:3000` (Next.js 15)
- DB: PostgreSQL 18 on port **3147** (local install, NOT Docker)
- Seed: `admin@syncops.dev / Admin@1234`

## Start Servers

```bash
# Backend (from /backend)
npm run dev

# Frontend (from /frontend)
npm run dev

# Re-seed if needed
npm run prisma:seed
```

## Key Invariants (never break these)

1. Stock is **never stored on Product** — always computed from `InventoryMovement` aggregation.
2. `freeToUseQty = onHandQty - reservedQty`. Reservations happen on Sales Order confirm and MO component reserve.
3. Every stock-changing operation MUST write an `InventoryMovement` row.
4. Every status transition MUST write an `AuditLog` row.
5. Procurement trigger fires ONLY from Sales Order confirm when `procureOnDemand = true` AND `freeToUseQty < ordered qty`.
6. PostgreSQL is on port **3147** not 5432.
7. JWT secret in `backend/.env` — never commit `.env`.

## Design System

Odoo-inspired light theme. Key tokens:
- Accent: `#714B67` (plum) — buttons, active nav
- Bg: white, Surface: `#F8F7F5`, Border: `#E5E7EB`
- Font: Inter
- Full spec: `docs/design.md`
