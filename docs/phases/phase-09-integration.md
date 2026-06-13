# Phase 09 - Integration & Demo QA

**Status:** DONE  
**Owner:** Shrujal00 + Teesha-Gokulgandhi  
**Depends on:** Phase 08

## Goal

End-to-end demo flow works from a local cold start. Seed data covers all required Shiv Furniture scenarios.

## Completed Scope

### INT-01 - Rich Seed Data

`backend/prisma/seed.ts` now seeds:

- Users for every role:
  - `admin@syncops.dev / Admin@1234`
  - `sales@syncops.dev / Sales@1234`
  - `purchase@syncops.dev / Purchase@1234`
  - `manufacturing@syncops.dev / Mfg@1234`
  - `inventory@syncops.dev / Inv@1234`
  - `owner@syncops.dev / Owner@1234`
- Vendors: Timber World, Metal Hub, FastPack Supplies
- Customers: Reliance Interiors, HomeDecor Co, OfficeSpaces Ltd
- Work centers: Assembly Line, Paint Floor, Packaging Unit
- Products and baseline inventory:
  - Wooden Table, Office Chair, Dining Table
  - Wooden Legs, Wooden Top, Screws
- Active BoMs:
  - Wooden Table: Wooden Legs x4, Wooden Top x1, Screws x12
  - Office Chair: Wooden Legs x4, Wooden Top x1, Screws x8
- Opening stock movements for raw materials and demo finished goods.

### INT-02 - End-To-End Flow Test

Use the live demo script:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/demo.ps1 -NoPause
```

The script exercises:

- Purchase receipt increasing raw material stock
- BoM creation and product linkage
- Sales demand confirmation
- Auto-procurement into a Manufacturing Order
- Manufacturing completion with component consumption and finished goods production
- Sales delivery with stock decrement
- Dashboard and audit log verification

### INT-03 - Local Cold Start

Local startup is:

```bash
npm install
cd backend
cp ../.env.example .env
npx prisma migrate dev
npm run prisma:seed
cd ..
npm run dev:backend
npm run dev:frontend
```

### INT-04 - Environment Verification

- `.env.example` includes all required backend/frontend local variables.
- `DATABASE_URL` points to the local PostgreSQL instance.
- `JWT_SECRET` is defined.
- `NEXT_PUBLIC_API_URL` points to `http://localhost:4000/api`.

### INT-05 - Final QA Checklist

- [x] Seed data present after `npm run prisma:seed`
- [x] Demo script exists for the live end-to-end flow
- [x] Dashboard and audit endpoints are available for verification
- [x] All 6 user roles can be seeded and used for login
- [x] Role-restricted backend routes are protected
- [x] TypeScript builds without errors through `npm run build`

## Done Criteria

- [x] Local full stack has documented startup steps
- [x] Seed data covers the required demo scenarios
- [x] Demo script executes the connected order-to-delivery flow
- [x] README updated with setup, demo users, and demo command
