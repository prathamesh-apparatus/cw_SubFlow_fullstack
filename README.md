# SubFlow — Subscription Management Platform

A production-quality, Dockerized platform for a single Admin to manage all of an organisation's software/SaaS subscriptions, organised by team (categories), with recurring-expense analytics and renewal tracking.

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS (frontend) · NestJS + TypeScript (backend) · PostgreSQL via the **native `pg` driver only — no ORM anywhere** (no Prisma / TypeORM / Sequelize / Drizzle). All SQL is raw, parameterized (`$1, $2, …`) and lives in services + `database/init/*.sql`.

## Project structure

```
cw_SubFlow_fullstack/
├── docker-compose.yml          # frontend + backend + postgres:16 (healthcheck, volume, init scripts)
├── .env.example                # copy to .env
├── database/init/              # manual SQL schema, mounted to /docker-entrypoint-initdb.d
│   ├── 001_create_admins.sql        # pgcrypto + admins
│   ├── 002_create_categories.sql
│   ├── 003_create_subscriptions.sql # subscriptions + payment_history, CHECK constraints
│   └── 004_create_indexes.sql
├── backend/                    # NestJS: auth, admin(seed), categories, subscriptions,
│   └── src/                    #   dashboard, renewals, database (pg Pool), common (guard/filter)
└── frontend/                   # Next.js App Router
    ├── app/                    # login, dashboard/* (categories, subscriptions, renewals, settings)
    ├── components/             # layout (Sidebar/Header), ui (shadcn-style primitives), dashboard charts, subscription form (sections A–E)
    ├── lib/                    # api.ts (fetch client), validations (Zod), utils
    ├── services/  types/  hooks/
    └── app/globals.css         # ★ DESIGN TOKENS: change CSS variables here → whole site restyles
```

## Quick start (Docker)

```bash
cp .env.example .env        # edit passwords / JWT_SECRET / ADMIN_EMAIL / ADMIN_PASSWORD
docker compose up --build
# Frontend: http://localhost:3000   Backend API: http://localhost:4000/api
```

PostgreSQL init scripts run automatically on a **fresh** volume. The backend container runs the admin seed on start.

## Admin account (seed)

There is **no public registration** — exactly one admin exists.

- Credentials come only from env: `ADMIN_EMAIL` / `ADMIN_PASSWORD` (never hardcoded).
- Seed: `backend/src/admin/seed.ts` — hashes the password with **bcrypt (cost 12)** and upserts idempotently:
  ```bash
  cd backend && npm install && npm run seed
  ```
- Login (`POST /api/auth/login`) sets an **HTTP-only cookie** `subflow_token` (JWT). `GET /api/auth/me` validates the session, `POST /api/auth/logout` clears it. Next.js middleware protects `/dashboard/*` and redirects to `/login`.
- To change credentials: update the env vars and re-run the seed.

## Local development (without Docker)

```bash
# 1. Postgres (any local instance), then apply schema in order:
psql -d subflow -f database/init/001_create_admins.sql   # …002, 003, 004

# 2. Backend
cd backend && cp .env.example .env && npm install && npm run seed && npm run start:dev   # :4000

# 3. Frontend
cd frontend && cp .env.example .env.local && npm install && npm run dev                  # :3000
```

> Schema changes on an existing database: write a new numbered SQL file in `database/init/` and apply it manually with `psql` — there is intentionally **no ORM migration tool**.

## Recurring-expense normalization

Monthly recurring cost per subscription (cancelled/expired excluded):

| Billing cycle | Monthly amount |
|---|---|
| Monthly | `total_amount` |
| Quarterly | `total_amount / 3` |
| Half-Yearly | `total_amount / 6` |
| Yearly | `total_amount / 12` |
| Custom (N days) | `total_amount × 30.4375 / N` — 30.4375 = average days per month (365.25 ÷ 12), so a 45-day plan costing ₹900 counts as ₹608.75/month |

Yearly recurring = monthly × 12. `total_amount = price + tax_amount` (computed on both frontend and backend). The dashboard "Monthly Expenses" chart is built from real `payment_history` rows (a row is written when a subscription is created/updated with a `last_payment_date`), zero-filled for the last 12 months — no hardcoded statistics anywhere.

## Features

- Dashboard: 8 summary cards, monthly-expenses chart (Recharts), category donut, upcoming renewals (7/15/30-day tabs), recently added.
- Categories: full CRUD, search/sort, subscription counts + expense per category; **delete is blocked (HTTP 409) while subscriptions exist**.
- Subscriptions: full CRUD with the A–E sectioned form (RHF + Zod, auto total), list with search, 5 filters, sorting, pagination, clear-filters; detail page with days-until-renewal.
- Renewals page: grouped Overdue / 7 / 15 / 30 days.
- Settings: real admin info from `/api/auth/me` + working logout (no dead buttons).

## Styling

All design tokens (colours, radius, sidebar, chart palette) are CSS variables in `frontend/app/globals.css`; `tailwind.config.ts` maps Tailwind utilities to those variables. Change a variable once — the entire site adapts.

## Merging this branch into main

```bash
# TODO: parent/reviewer fills in the exact merge command for this repo's flow, e.g.:
# git checkout main && git merge muse && git push origin main
```

## Security notes

- Parameterized SQL everywhere (no string concatenation of user input); transactions for multi-write operations.
- Passwords: bcrypt only. Payment credentials (card numbers/CVV) are **never** stored — only method/status/notes.
- Backend secrets are never exposed via `NEXT_PUBLIC_*` variables.

