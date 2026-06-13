# 00 — Infrastructure

**Status: DONE**

## Tasks

### AUTH-01 · JWT login + register
**Status:** DONE  
**Files:** `backend/src/modules/auth/service.ts`, `repository.ts`, `validation.ts`  
**Done:** scrypt hash + timingSafeEqual verify. JWT sign via `jsonwebtoken`. POST /auth/login + /auth/register both live.

### AUTH-02 · Auth middleware
**Status:** DONE  
**Files:** `backend/src/common/middleware/auth.middleware.ts`  
**Done:** Verifies Bearer JWT, attaches `JwtPayload` ({ sub, roleId, roleName }) to `req.user`.

### AUTH-03 · RBAC guard
**Status:** DONE  
**Files:** `backend/src/common/guards/rbac.guard.ts`  
**Done:** `requireRoles(...roles)` factory — checks `req.user.roleName`, returns 403 if not in list.

### INFRA-01 · DB seed (roles + admin user)
**Status:** DONE  
**Files:** `backend/prisma/seed.ts`  
**Done:** Seeds all 6 roles + `admin@syncops.dev / Admin@1234`. Idempotent upsert. `npm run prisma:seed`.

### DESIGN-01 · Design system
**Status:** DONE  
**Files:** `docs/design.md`, `frontend/src/app/globals.css`, `frontend/tailwind.config.ts`  
**Done:** Odoo light theme. Plum accent `#714B67`. White bg, light gray surface. CSS tokens + Tailwind semantic colors.

### FE-INFRA-01 · App shell + sidebar
**Status:** DONE  
**Files:** `frontend/src/components/layouts/sidebar.tsx`, `frontend/src/app/(dashboard)/layout.tsx`, `frontend/src/app/(erp)/layout.tsx`  
**Done:** Sidebar with role-filtered nav, user avatar, sign out. Shared layout for dashboard + ERP route groups.

### FE-INFRA-02 · Auth store + API client + middleware
**Status:** DONE  
**Files:** `frontend/src/store/app-store.ts`, `frontend/src/services/api-client.ts`, `frontend/src/middleware.ts`  
**Done:** Zustand persist store (accessToken + user). fetch wrapper with JWT injection. Next.js middleware redirects unauthenticated → /login.

### FE-INFRA-03 · Login page
**Status:** DONE  
**Files:** `frontend/src/app/(auth)/login/page.tsx`  
**Done:** Full login form. Sets JWT cookie on success. Redirects to /overview. Error + loading states.
