# SubFlow — Subscription Management Platform

A production-quality platform for a single Admin to manage all of an organisation's software/SaaS subscriptions, organised by team (categories), with recurring-expense analytics and renewal tracking.

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS — **UI and API in one Next.js app, on one port** (route handlers under `app/api/`). PostgreSQL via the **native `pg` driver only — no ORM anywhere** (no Prisma / TypeORM / Sequelize / Drizzle). All SQL is raw, parameterized (`$1, $2, …`) and lives in `lib/` + `database/init/*.sql`. Docker is used for the database only.

## Project structure

```
cw_SubFlow_fullstack/           # ONE flat Next.js project at the root — no frontend/backend folders
├── docker-compose.yml          # database only: postgres:16 (named volume postgres_data)
├── .env                        # the only env file (copy of .env.example, at the root)
├── app/                        # login, dashboard/* (categories, subscriptions, domains, renewals, settings, notifications)
├── app/api/                    # API route handlers: auth, categories, subscriptions, domains, dashboard, renewals, notifications, health
├── components/                 # layout (Sidebar/Header), ui (shadcn-style primitives), dashboard charts, subscription + domain forms/drawers
├── database/init/              # manual SQL schema, mounted to /docker-entrypoint-initdb.d
│   ├── 001_create_admins.sql        # pgcrypto + admins
│   ├── 002_create_categories.sql
│   ├── 003_create_subscriptions.sql # subscriptions + payment_history, CHECK constraints
│   ├── 004_create_indexes.sql
│   ├── 005_notifications.sql
│   ├── 006_create_domains.sql       # domains (internal/external, purchase + management + expiry)
│   └── 007_create_subscription_members.sql # who can use each subscription (name + optional email)
├── lib/                        # api.ts (fetch client), validations (Zod), utils +
│                               #   server-only: db.ts (pg Pool), auth.ts (JWT/bcrypt), renewal.ts,
│                               #   categories.ts, subscriptions.ts, domains.ts, dashboard.ts, notifications.ts, mail.ts (Nodemailer/SMTP)
├── scripts/seed-admin.mjs      # admin seed (npm run seed)
├── services/  types/  hooks/
└── app/globals.css             # ★ DESIGN TOKENS: change CSS variables here → whole site restyles
```

## Quick start

There is exactly **one env file: `.env` at the project root** (copy `.env.example`).
**Docker runs just the database**; the **app (UI + API together) runs with npm** on a single port.

```powershell
# 0. One-time: create the env file and set your values:
Copy-Item .env.example .env   # edit DATABASE_PASSWORD / JWT_SECRET / ADMIN_EMAIL / ADMIN_PASSWORD / SMTP_* (email, optional)

# 1. Database — ONE Docker command (from the project root; reads the root .env automatically):
docker compose up -d
#    Starts Postgres only (tables auto-created on first run). Your existing
#    postgres_data volume is reused — no data is lost.

# 2. App — npm (separate terminal, same root folder):
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
  npm run seed
  ```
- Login (`POST /api/auth/login`) sets an **HTTP-only cookie** `subflow_token` (JWT, HS256 via `jose`, 7-day expiry). `GET /api/auth/me` validates the session, `POST /api/auth/logout` clears it. Next.js middleware protects `/dashboard/*` and redirects to `/login`.
- Existing password hashes from before the migration keep working — bcryptjs verifies standard bcrypt `$2b$` hashes.

## Local development (own local Postgres, no Docker at all)

```bash
# 1. Create the database, then apply schema in order:
psql -d subflow -f database/init/001_create_admins.sql   # …002, 003, 004, 005, 006, 007

# 2. App (UI + API on one port)
cp .env.example .env && npm install && npm run dev   # :3000
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

Yearly recurring = monthly × 12. `total_amount = price + tax_amount` (computed on both frontend and server). The dashboard "Monthly Expenses" chart is computed **live from subscriptions** (for each of the last 12 months, the monthly-normalised cost of every subscription that existed then) — no hardcoded statistics anywhere. A subscription's **next renewal date is computed on the server** from its start date + billing cycle (the form only asks for start and end dates).

## Features

- Dashboard: 8 summary cards, monthly-expenses chart (Recharts), category donut, upcoming renewals (7/15/30-day tabs), recently added.
- Categories: full CRUD, search/sort, subscription counts + expense per category; **delete is blocked (HTTP 409) while subscriptions exist**.
- Subscriptions: full CRUD with the A–E sectioned form (RHF + Zod, auto total), list with search, 5 filters, sorting, pagination, clear-filters; view/edit/delete happens in the slide-over panel on All Subscriptions.
- Domains: full CRUD for organisation domains (Internal / External) — see the Domains module section below.
- Renewals page: grouped Overdue / 7 / 15 / 30 days.
- Notifications: header bell + page; renewal overdue/upcoming and payment-failed alerts generated from live data, with optional email to the admin via Nodemailer (SMTP — set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME` in `.env`; for Gmail use an App Password as `SMTP_PASS`). Leave the SMTP vars empty to skip emails.
- Settings: change email + change password (working, via `/api/auth/*`), real admin info from `/api/auth/me` + working logout.

**Subscription members ("Who can use this subscription"):** a subscription's account is often shared by 2–3 team members, so each subscription can record who may use it — a list of members (name + optional email, max 20) stored in `subscription_members` (`database/init/007_create_subscription_members.sql`; `lib/subscriptions.ts` bootstraps the same DDL lazily for existing databases). The form's Section A has dynamic member rows; create/update accept a `members` array (updates replace the whole list, and only when the key is sent), `GET /api/subscriptions/:id` returns `members`, the list returns `member_count`, the details panel shows a "Shared with" section, and deleting a subscription cascades its members away.

## Domains Management module

Manage every organisation domain next to the subscriptions: where it was **purchased** (registrar), who **manages** it (kept as a separate field — a domain can be bought on GoDaddy and managed on Cloudflare), what it costs, and when it expires. Page: `/dashboard/domains` (sidebar → Domains), with search, filters (type / project / registrar / manager / status), sorting (expiry, purchase cost, name), pagination, and the same slide-over drawer pattern as subscriptions for view / edit / delete (delete asks for confirmation). The form has sections A–E: Basic, Purchase, Management, Expiry & Renewal, Additional.

**API (all behind the single-admin session, same envelope as the rest of the app):**

| Endpoint | What |
|---|---|
| `GET /api/domains` | List — `search`, `type`, `project`, `registrar`, `manager`, `status`, `sort` (`expiry_date` / `purchase_cost` / `domain_name` / `created_at`), `order`, `page`, `limit` |
| `POST /api/domains` | Create (domain name is trimmed + lowercased; duplicates → `409 Domain with this name already exists`) |
| `GET /api/domains/[id]` | Details (includes computed `days_remaining`) |
| `PATCH /api/domains/[id]` | Update (merged with the stored row; activity notification carries a diff of the key fields) |
| `DELETE /api/domains/[id]` | Delete → `{ deleted: true }` |
| `GET /api/domains/upcoming-expiries` | Expiring within the next 30 days (status ≠ cancelled) |
| `GET /api/domains/expired` | Expiry date in the past (status ≠ cancelled) |
| `GET /api/domains/statistics` | Counts, per-currency costs, breakdowns by type and by project, next 5 upcoming renewals |
| `GET /api/domains/projects` | Facets for the UI: distinct `{ projects, registrars, managers }` |

**Project association:** SubFlow has **no projects system/table**, so a domain stores an optional free-text `project_name` — the form offers the distinct names already in use via a datalist (and you can type a new one), the list/details/filter all use it, one project can have many domains, and a domain can have none (`No project` in breakdowns). The `project_id UUID` column exists but is intentionally **without a foreign key**, reserved for a future projects table; deleting a domain never touches any project data.

**Expiry tracking & notifications:** `expiry_date` and `next_renewal_date` are **never entered manually** — the form only asks for the purchase date and billing cycle, and on every save the server computes both dates from them (purchase date + one cycle, rolled forward to the next future date — the same rule subscriptions use; `registration_date` mirrors the purchase date). If a domain has no purchase date, its previously stored expiry dates are left untouched. `days_remaining` is computed in SQL from the stored `expiry_date`. The notification sync (the same one that produces subscription renewal alerts) also generates `domain_expiry_upcoming` — when a domain has its reminder enabled and `days_remaining <= reminder_days_before` (3/7/15/30) — and `domain_expired`, each **deduped per domain + expiry date (+ reminder period)**, and newly created ones get the same SMTP email (via Nodemailer) as renewal alerts. Add / update (with a key-field diff) / delete of a domain are recorded as activity notifications, like subscriptions and categories.

**Costs:** purchase cost and renewal cost are stored separately, with currency and billing cycle. All totals are **grouped by currency and never combined across currencies**. The yearly figure normalises the effective cost (renewal cost when set, otherwise purchase cost): monthly × 12, yearly × 1, custom × (365.25 ÷ custom days). Domain statistics (total / internal / external / active / expired / expiring soon, cost totals, upcoming renewals) are computed live from the `domains` table and integrated into the main dashboard — domain totals live in the Overview card and upcoming domain renewals inside the Upcoming Renewals card — while remaining completely separate from subscription expenses.

**Schema:** `database/init/006_create_domains.sql` (fresh installs). Because existing database volumes never re-run init scripts, `lib/domains.ts` also bootstraps the identical DDL lazily (`CREATE TABLE / INDEX IF NOT EXISTS`) on first use — the same pattern the notifications table uses. Domain attachments are **not** supported (SubFlow has no file-upload infrastructure); the invoice/purchase reference is stored as text.

## Styling

All design tokens (colours, radius, sidebar, chart palette) are CSS variables in `app/globals.css`; `tailwind.config.ts` maps Tailwind utilities to those variables. Change a variable once — the entire site adapts.

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
- Server secrets (database password, JWT secret, SMTP password) live only in non-`NEXT_PUBLIC_*` env vars and are never exposed to the browser.
