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

## Setup

**Prerequisites:** Node >=20, PostgreSQL running locally.

```bash
# Install dependencies
npm install

# Backend — copy env, run migrations, seed DB
cd backend
cp ../.env.example .env   # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run prisma:seed       # seeds 6 roles + admin@syncops.dev / Admin@1234

# Run
npm run dev:backend       # http://localhost:4000
npm run dev:frontend      # http://localhost:3000
```

## Architecture

- Feature-first modules: controller → service → repository → Prisma.
- Services own all business rules.
- Repositories own all DB interaction.
- DTOs and Zod validators at every HTTP boundary.

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
