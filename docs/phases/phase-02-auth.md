# Phase 02 — Auth & Infrastructure

**Status:** DONE  
**Owner:** Teesha-Gokulgandhi (backend) · Shrujal00 (frontend)  
**Completed:** 2026-06-13

## What Was Built

### Backend
- `POST /api/auth/login` — scrypt verify, JWT sign, returns `{ accessToken, user }`
- `POST /api/auth/register` — hash password, assign role, return token
- `authenticateRequest` middleware — verifies Bearer JWT, attaches `{ sub, roleId, roleName }` to `req.user`
- `requireRoles(...roles)` RBAC guard factory — 403 on role mismatch
- DB seed — 6 roles + `admin@syncops.dev / Admin@1234`

### Frontend
- Zustand persist store — `accessToken` + `user` survive page refresh
- Fetch API client — injects JWT, throws typed errors on non-2xx
- Next.js middleware — unauthenticated → `/login`, authenticated → away from login
- Login page — plum design, error/loading states, sets JWT cookie, redirects `/overview`
- Sidebar shell — role-filtered nav, avatar with initials, sign out
- App shell layout — shared for `(dashboard)` and `(erp)` route groups

### Design System
- Odoo-inspired light theme: plum `#714B67` accent, white bg, `#F8F7F5` surface
- CSS token system in `globals.css`, Tailwind semantic colors
- Full spec in `docs/design.md`

## Done Criteria
- [x] `POST /api/auth/login` returns JWT with correct payload
- [x] `POST /api/auth/register` creates user with hashed password
- [x] Protected route returns 403 for wrong role
- [x] DB seed runs without error
- [x] Login form works end-to-end, redirects to /overview
- [x] Sidebar shows only role-appropriate nav items
