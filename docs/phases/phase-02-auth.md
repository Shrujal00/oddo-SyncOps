# Phase 02 — Auth & Infrastructure

**Status:** TODO  
**Owner:** Teesha-Gokulgandhi (backend) · Shrujal00 (frontend login page)  
**Blocks:** All other phases  

## Goal
Working JWT authentication + role-based access + seeded database.

## Backend Tasks

### AUTH-01 · Register endpoint
`POST /api/auth/register`
- Hash password with bcrypt (rounds = 12)
- Lookup role by `RoleName` enum
- Create User, return JWT + profile
- Validation: email format, password min 8 chars

### AUTH-02 · Login endpoint
`POST /api/auth/login`
- Lookup user by email (case-insensitive)
- bcrypt compare, throw 401 on mismatch
- Return `{ token, user: { id, email, firstName, lastName, role } }`
- JWT payload: `{ sub: userId, roleId, roleName, iat, exp }`

### AUTH-03 · Auth middleware (verify)
`backend/src/common/middleware/auth.middleware.ts`
- Extract `Authorization: Bearer <token>`
- Verify with `ACCESS_TOKEN_SECRET`
- Attach decoded payload to `req.user`
- Throw 401 if missing or invalid

### AUTH-04 · RBAC guard (implement)
`backend/src/common/guards/rbac.guard.ts`
- Factory: `rbacGuard(...roles: RoleName[]) => RequestHandler`
- Check `req.user.roleName` against allowed list
- Throw 403 if not in list

### AUTH-05 · DB seed
Create `backend/prisma/seed.ts`:
- Seed all 6 roles
- Seed admin user: `admin@syncops.dev` / `Admin@1234`
- Add `"prisma": { "seed": "tsx prisma/seed.ts" }` to `backend/package.json`
- Run: `npx prisma db seed`

## Frontend Tasks

### FE-AUTH-01 · Login form
`frontend/src/app/(auth)/login/page.tsx`
- Email + password fields
- POST `/api/auth/login`
- Store JWT in Zustand + localStorage
- Redirect to `/overview` on success

### FE-AUTH-02 · Auth guard middleware
Create `frontend/src/middleware.ts`
- Protect `/overview` and `/erp/**` routes
- Redirect unauthenticated → `/login`

## Done Criteria
- [ ] `POST /api/auth/login` returns JWT with correct payload
- [ ] `POST /api/auth/register` creates user with hashed password
- [ ] Protected route returns 403 for wrong role
- [ ] DB seed runs without error
- [ ] Login form works end-to-end, redirects to dashboard
