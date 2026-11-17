# SubFlow — Subscription Management Platform

A production-quality platform for a single Admin to manage all of an organisation's software/SaaS subscriptions, organised by team (categories), with recurring-expense analytics and renewal tracking.

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS — **UI and API in one Next.js app, on one port** (route handlers under `frontend/app/api/`). PostgreSQL via the **native `pg` driver only — no ORM anywhere** (no Prisma / TypeORM / Sequelize / Drizzle). All SQL is raw, parameterized (`$1, $2, …`) and lives in `frontend/lib/` + `frontend/database/init/*.sql`. Docker is used for the database only.

## Project structure

```
cw_SubFlow_fullstack/
├── docker-compose.yml          # database only: postgres:16 (named volume postgres_data)
└── frontend/                   # Next.js App Router — the whole app (.env lives here)
    ├── app/                    # login, dashboard/* (categories, subscriptions, renewals, settings, notifications)
    ├── app/api/                # API route handlers: auth, categories, subscriptions, dashboard, renewals, notifications, health
    ├── components/             # layout (Sidebar/Header), ui (shadcn-style primitives), dashboard charts, subscription form (sections A–E)
    ├── database/init/          # manual SQL schema, mounted to /docker-entrypoint-initdb.d
    │   ├── 001_create_admins.sql        # pgcrypto + admins
    │   ├── 002_create_categories.sql
    │   ├── 003_create_subscriptions.sql # subscriptions + payment_history, CHECK constraints
    │   ├── 004_create_indexes.sql
    │   └── 005_notifications.sql
    ├── lib/                    # api.ts (fetch client), validations (Zod), utils +
    │                           #   server-only: db.ts (pg Pool), auth.ts (JWT/bcrypt), renewal.ts,
    │                           #   categories.ts, subscriptions.ts, dashboard.ts, notifications.ts, mail.ts (Brevo)
    ├── scripts/seed-admin.mjs  # admin seed (npm run seed)
    ├── services/  types/  hooks/
    └── app/globals.css         # ★ DESIGN TOKENS: change CSS variables here → whole site restyles
```

## Quick start

There is **no root `.env`** — the only env file is `frontend/.env`.
**Docker runs just the database**; the **app (UI + API together) runs with npm** on a single port.

```powershell
# 0. One-time: create the env file and set your values:
cd frontend; Copy-Item .env.example .env   # edit DATABASE_PASSWORD / JWT_SECRET / ADMIN_EMAIL / ADMIN_PASSWORD / BREVO_API_KEY
cd ..

# 1. Database — ONE Docker command (from the project root):
docker compose --env-file frontend/.env up -d
#    Starts Postgres only (tables auto-created on first run). Your existing
#    postgres_data volume is reused — no data is lost.

# 2. App — npm (separate terminal):
cd frontend
npm i
npm run dev                   # website + API on http://localhost:3000 (or 3001 if 3000 is busy)
```

Stop the database with `docker compose down` (from the project root); your data stays in the volume.

## Admin account (seed)

There is **no public registration** — exactly one admin exists.

- Credentials come only from env: `ADMIN_EMAIL` / `ADMIN_PASSWORD` (never hardcoded).
- **Auto-seed:** on the first login attempt, if the `admins` table is empty, the admin is created automatically from those env vars (bcryptjs, cost 12) — no separate step needed.
- Explicit seed (also how you change the password later): hashes with **bcryptjs (cost 12)** and upserts idempotently:
  ```bash
  cd frontend && npm run seed
  ```
- Login (`POST /api/auth/login`) sets an **HTTP-only cookie** `subflow_token` (JWT, HS256 via `jose`, 7-day expiry). `GET /api/auth/me` validates the session, `POST /api/auth/logout` clears it. Next.js middleware protects `/dashboard/*` and redirects to `/login`.
- Existing password hashes from before the migration keep working — bcryptjs verifies standard bcrypt `$2b$` hashes.

## Local development (own local Postgres, no Docker at all)

```bash
# 1. Create the database, then apply schema in order:
psql -d subflow -f frontend/database/init/001_create_admins.sql   # …002, 003, 004, 005

# 2. App (UI + API on one port)
cd frontend && cp .env.example .env && npm install && npm run dev   # :3000
```

> Schema changes on an existing database: write a new numbered SQL file in `frontend/database/init/` and apply it manually with `psql` — there is intentionally **no ORM migration tool**.

## Recurring-expense normalization

Monthly recurring cost per subscription (cancelled/expired excluded):

| Billing cycle | Monthly amount |
|---|---|
| Monthly | `total_amount` |
| Quarterly | `total_amount / 3` |
| Half-Yearly | `total_amount / 6` |
| Yearly | `total_amount / 12` |
| Custom (N days) | `total_amount × 30.4375 / N` — 30.4375 = average days per month (365.25 ÷ 12), so a 45-day plan costing ₹900 counts as ₹608.75/month |

Yearly recurring = monthly × 12. `total_amount = price + tax_amount` (computed on both frontend and server). The dashboard "Monthly Expenses" chart is computed **live from subscriptions** (for each of the last 12 months, the monthly-normalised cost of every subscription that existed then) — no hardcoded statistics anywhere. A subscription's **next renewal date is computed on the server** from its start date + billing cycle (the form only asks for start and end dates).

## Features

- Dashboard: 8 summary cards, monthly-expenses chart (Recharts), category donut, upcoming renewals (7/15/30-day tabs), recently added.
- Categories: full CRUD, search/sort, subscription counts + expense per category; **delete is blocked (HTTP 409) while subscriptions exist**.
- Subscriptions: full CRUD with the A–E sectioned form (RHF + Zod, auto total), list with search, 5 filters, sorting, pagination, clear-filters; view/edit/delete happens in the slide-over panel on All Subscriptions.
- Renewals page: grouped Overdue / 7 / 15 / 30 days.
- Notifications: header bell + page; renewal overdue/upcoming and payment-failed alerts generated from live data, with optional Brevo email to the admin.
- Settings: change email + change password (working, via `/api/auth/*`), real admin info from `/api/auth/me` + working logout.

## Styling

All design tokens (colours, radius, sidebar, chart palette) are CSS variables in `frontend/app/globals.css`; `tailwind.config.ts` maps Tailwind utilities to those variables. Change a variable once — the entire site adapts.

## Merging this branch into main

```bash
git fetch origin
git switch main
git pull origin main
git merge origin/muse --no-edit
git push origin main
```

## Security notes

- Parameterized SQL everywhere (no string concatenation of user input); transactions for multi-write operations.
- Passwords: bcrypt only. Payment credentials (card numbers/CVV) are **never** stored — only method/status/notes.
- Server secrets (database password, JWT secret, Brevo key) live only in non-`NEXT_PUBLIC_*` env vars and are never exposed to the browser.
