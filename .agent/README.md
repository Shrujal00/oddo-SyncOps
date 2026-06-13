# Agent Progress Tracker

This folder is the source of truth for implementation progress.
AI agents and humans: **read this before touching any code.**

## How to use

- Each file = one module or cross-cutting concern.
- Every task has a status: `TODO` | `IN_PROGRESS` | `DONE`.
- When you pick up a task, change status to `IN_PROGRESS` and note what file you're editing.
- When done, change to `DONE` and add a one-line summary of what was implemented.

## Module Files

| File | Covers |
|------|--------|
| [00-infrastructure.md](./00-infrastructure.md) | Auth, RBAC guard, error handling |
| [01-products.md](./01-products.md) | Product CRUD + stock qty compute |
| [02-inventory.md](./02-inventory.md) | InventoryMovement ledger |
| [03-sales.md](./03-sales.md) | Sales orders, confirm, deliver |
| [04-purchases.md](./04-purchases.md) | Purchase orders, receive |
| [05-manufacturing.md](./05-manufacturing.md) | MO, Work Orders, BoM, WorkCenter |
| [06-procurement.md](./06-procurement.md) | MTS/MTO automation trigger |
| [07-audit.md](./07-audit.md) | Audit log writes + query |
| [08-dashboard.md](./08-dashboard.md) | Aggregated stats queries |
| [09-frontend.md](./09-frontend.md) | Frontend pages + API wiring |

## Key Invariants (never break these)

1. Stock is **never stored on Product** — always computed from `InventoryMovement` aggregation.
2. `freeToUseQty = onHandQty - reservedQty`. Reservations happen on Sales Order confirm and MO component reserve.
3. Every stock-changing operation MUST write an `InventoryMovement` row.
4. Every status transition MUST write an `AuditLog` row.
5. Procurement trigger fires ONLY from Sales Order confirm when `procureOnDemand = true` AND `freeToUseQty < ordered qty`.
