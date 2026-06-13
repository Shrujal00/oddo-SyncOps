# 00 — Infrastructure

Blocker for all other modules. Must be DONE first.

## Tasks

### AUTH-01 · JWT login + register
**Status:** TODO  
**Files:** `backend/src/modules/auth/service.ts`, `repository.ts`, `validation.ts`  
**What to implement:**
- `register`: hash password (bcrypt), create User with role lookup, return JWT
- `login`: lookup by email, compare hash, return JWT + user profile
- JWT payload: `{ sub: userId, roleId, roleName, iat, exp }`
- Use `ACCESS_TOKEN_SECRET` + `ACCESS_TOKEN_EXPIRY` from `src/config/env.ts`

### AUTH-02 · Auth middleware
**Status:** DONE (scaffold exists)  
**Files:** `backend/src/common/middleware/auth.middleware.ts`  
**Notes:** Verify JWT, attach decoded payload to `req.user`. Already scaffolded — check it works.

### AUTH-03 · RBAC guard
**Status:** TODO  
**Files:** `backend/src/common/guards/rbac.guard.ts`, `backend/src/common/constants/rbac.ts`  
**What to implement:**
- Guard reads `req.user.roleName`, checks against allowed roles for route
- Use as Express middleware factory: `rbacGuard(["ADMIN", "SALES_USER"])`

### INFRA-01 · DB seed (roles + admin user)
**Status:** TODO  
**Files:** create `backend/prisma/seed.ts`  
**What to implement:**
- Seed all 6 roles: ADMIN, SALES_USER, PURCHASE_USER, MANUFACTURING_USER, INVENTORY_MANAGER, BUSINESS_OWNER
- Seed one admin user (email from env or hardcoded default)
- Add `"prisma": { "seed": "tsx prisma/seed.ts" }` to `backend/package.json`
