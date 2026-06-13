# Phase 09 — Integration & Deploy

**Status:** TODO  
**Owner:** Shrujal00 + Teesha-Gokulgandhi  
**Depends on:** Phase 08  

## Goal
End-to-end demo flow works from cold start. Docker Compose brings up the full stack. Seed data covers all demo scenarios.

## Tasks

### INT-01 · Rich seed data
`backend/prisma/seed.ts` (extend Phase 02 seed):

**Users (one per role):**
- admin@syncops.dev / Admin@1234
- sales@syncops.dev / Sales@1234
- purchase@syncops.dev / Purchase@1234
- manufacturing@syncops.dev / Mfg@1234
- inventory@syncops.dev / Inv@1234
- owner@syncops.dev / Owner@1234

**Vendors:** Timber World, Metal Hub, FastPack Supplies  
**Customers:** Reliance Interiors, HomeDecor Co, OfficeSpaces Ltd  
**Work Centers:** Assembly Line, Paint Floor, Packaging Unit  

**Products + BoMs (Shiv Furniture scenario):**
- Wooden Table (finished good, supplyStrategy=MAKE)
  - BoM: Wooden Legs ×4, Wooden Top ×1, Screws ×12
  - Operations: Assembly 60min, Painting 30min, Packing 20min
- Office Chair (finished good, supplyStrategy=MAKE)
- Dining Table (finished good, supplyStrategy=BUY, vendor=Timber World)
- Raw materials (Wooden Legs, Wooden Top, Screws) with initial stock via PURCHASE movements

### INT-02 · End-to-end flow test (manual checklist)

**Flow A — MTS (Make to Stock):**
1. Login as Sales User
2. Create SO: 5 Wooden Tables (stock = 10) → Confirm → Stock reserved → Deliver → Stock decreases

**Flow B — MTO / Make:**
1. Create SO: 20 Wooden Tables (stock = 5, shortfall = 15)
2. Confirm → MO auto-created for 15 units
3. Login as Manufacturing User → Start MO → Complete → Components consumed, finished goods added
4. Deliver remaining SO items

**Flow C — MTO / Buy:**
1. Create SO: 10 Dining Tables (stock = 2, shortfall = 8)
2. Confirm → PO auto-created for 8 units
3. Login as Purchase User → Confirm PO → Receive → Stock increases
4. Deliver SO

**Flow D — Audit trail:**
- Confirm all above events appear in audit log with correct user/event type

### INT-03 · Docker Compose bring-up
Update `docker-compose.yml` if needed:
- postgres service (already present)
- Add backend service: build from `./backend`, port 3001
- Add frontend service: build from `./frontend`, port 3000
- Ensure `prisma migrate deploy && prisma db seed` runs on backend startup

### INT-04 · Environment verification
- All `.env.example` vars have values in `.env`
- `DATABASE_URL` points to docker postgres
- `ACCESS_TOKEN_SECRET` set
- CORS origin includes frontend URL

### INT-05 · Final QA checklist
- [ ] `docker compose up` cold start works
- [ ] Seed data present after startup
- [ ] All 3 demo flows (A, B, C) complete without errors
- [ ] Dashboard shows correct counts after each flow
- [ ] Audit log shows all events
- [ ] All 6 user roles can log in
- [ ] Role-restricted routes return 403 for wrong role
- [ ] No console errors in browser
- [ ] TypeScript builds without errors (`npm run build`)

## Done Criteria
- [ ] Full stack runs from single `docker compose up`
- [ ] Demo script (Flows A, B, C) executes without any manual DB intervention
- [ ] README updated with setup instructions
