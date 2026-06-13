# SyncOps

**From Demand to Delivery**

SyncOps is a modern ERP scaffold that connects product management, inventory, sales, purchases, manufacturing, procurement, audit logging, and dashboard analytics in one feature-first codebase.

## Workspace

```text
syncops/
  frontend/  Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui
  backend/   Express.js, TypeScript, Prisma ORM, PostgreSQL, JWT-ready auth
  docs/      Architecture, schema, API, RBAC, and workflow notes
```

## Commands

```bash
npm install
npm run dev:frontend
npm run dev:backend
docker compose up -d
```

## Scaffold Principles

- Feature-first architecture.
- Controllers receive requests, call services, and return responses.
- Services own business rules.
- Repositories own database interaction.
- DTOs, validators, and route contracts are explicit.
- This scaffold intentionally contains no business logic or CRUD implementation.

## ERP Modules

- Authentication
- User Management
- Product Management
- Inventory Management
- Sales Orders
- Purchase Orders
- Manufacturing Orders
- Bill of Materials
- Procurement Automation
- Audit Logs
- Dashboard Analytics

## Documentation

- `docs/folder-tree.md`
- `docs/architecture.md`
- `docs/database-schema.md`
- `docs/api-spec.md`
- `docs/rbac.md`
- `docs/workflow.md`
