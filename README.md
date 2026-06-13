# SyncOps

**From Demand to Delivery**

SyncOps is a modern ERP that connects product management, inventory, sales, purchases, manufacturing, procurement, audit logging, and dashboard analytics in one feature-first codebase.

## Workspace

```text
syncops/
  frontend/  Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui
  backend/   Express.js, TypeScript, Prisma ORM, PostgreSQL, JWT auth
  docs/      Architecture, schema, API, RBAC, and workflow notes
```

## Setup

**Prerequisites:** Node >=20 and PostgreSQL running locally.

```bash
# Install dependencies
npm install

# Backend - copy env, run migrations, seed DB
cd backend
cp ../.env.example .env   # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run prisma:seed       # seeds users, partners, products, BoMs, and demo stock

# Run from the repo root
npm run dev:backend       # http://localhost:4000
npm run dev:frontend      # http://localhost:3000
```

## Demo Logins

- `admin@syncops.dev / Admin@1234`
- `sales@syncops.dev / Sales@1234`
- `purchase@syncops.dev / Purchase@1234`
- `manufacturing@syncops.dev / Mfg@1234`
- `inventory@syncops.dev / Inv@1234`
- `owner@syncops.dev / Owner@1234`

## Demo Flow

After the backend and frontend are running, execute:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/demo.ps1 -NoPause
```

The script runs the connected demand-to-delivery flow through products, purchases, BoM, sales, procurement, manufacturing, inventory, audit, and dashboard.

## Architecture

- Feature-first modules: controller -> service -> repository -> Prisma.
- Services own all business rules.
- Repositories own all DB interaction.
- DTOs and Zod validators sit at every HTTP boundary.

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
