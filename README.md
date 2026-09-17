# Aekovera CPG Marketplace

A two-sided B2B marketplace connecting consumer packaged goods (CPG) brands with
retail buyers. This repository implements **Phase 0 (Foundation)** from
`docs/specs/08_EXECUTION_PLAN.md`.

## Phase 0 — what works today

The app boots, builds, and passes all tests with **zero API keys**. Every
external service (Supabase Auth, Algolia, Stripe, Inngest, Resend, Sentry,
PostHog) sits behind a typed adapter with a mock default implementation; real
keys later drop in via `.env` with no code changes (mock-first doctrine).

```bash
npm install
npm run dev        # landing page at http://localhost:3000 — no env keys needed
npm test           # unit tests + RLS isolation suite
npm run lint && npm run typecheck
npm run build
```

Demo accounts (mock auth mode, seeded in `src/lib/auth/mock.ts`):

| Role  | Email                      | Password  |
| ----- | -------------------------- | --------- |
| Brand | brand@demo.aekovera.com    | demo1234  |
| Buyer | buyer@demo.aekovera.com    | demo1234  |
| Admin | admin@demo.aekovera.com    | demo1234  |

## Database & migrations

Plain numbered SQL in `supabase/migrations/` (no ORM — the spec locks
PostgreSQL + Supabase). Apply everything with the transactional runner:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/aekovera_test node supabase/migrate.mjs
```

| Migration | Contents |
| --- | --- |
| `0001_init.sql` | Full marketplace schema, indexes, triggers, Supabase compat shims (auth schema, client roles, `auth.uid()`/`auth.role()`) |
| `0002_rls.sql` | Row-Level Security: RLS on every application table, the security-spec policies, operational-table lockdown |
| `0003_seed_taxonomy.sql` | Category/subcategory taxonomy |
| `0004_seed_certifications.sql` | CPG certifications reference |

Migrations are idempotent where safe and target **PostgreSQL 16**, staying
Supabase-compatible (locally the `auth` schema is a shim; on Supabase the
platform's own schema and roles win).

### RLS test suite (proof of tenant isolation)

`tests/rls.test.ts` connects as real client roles — `anon`, `authenticated`
(switching between two brands and two buyers), and `service_role` (BYPASSRLS) —
and asserts the policies from `07_SECURITY_PAYMENTS_SPEC.md`:

- a brand cannot read or modify another brand's profile, products, or submissions
- buyer profiles are invisible to brands; buyers see only their own
- draft products/opportunities never leak across tenants (published ones are public by design)
- conversation participants see messages; non-participants see nothing
- sender impersonation is rejected by `WITH CHECK (sender_user_id = auth.uid())`
- `audit_log` / `processed_webhook_events` are invisible to clients, readable by `service_role`

```bash
TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/aekovera_test npx vitest run tests/rls.test.ts
```

## F-task mapping (Phase 0 → implementation)

| Task | Deliverable | Implementation |
| --- | --- | --- |
| F-01 | Next.js 15 scaffold (App Router, TS strict, Tailwind, shadcn/ui) | Root config, `src/app/`, `src/components/ui/`, landing page |
| F-02 | Supabase project setup | `supabase/migrations/` + local/CI PostgreSQL 16 runner; Supabase compat shims in `0001` |
| F-03 | All database tables + seeds | `0001_init.sql` (23 tables incl. operational), constraints, indexes |
| F-04 | RLS policies, tested with different roles | `0002_rls.sql`; `tests/rls.test.ts` (26 isolation assertions) |
| F-05 | Supabase Auth (email/password + Google OAuth) | `src/lib/auth/supabase.ts` behind `AuthAdapter` |
| F-06 | Auth middleware: role detection + redirects | `src/middleware.ts` + `src/lib/session-cookie.ts`; routes `/brand/*`, `/buyer/*`, `/admin/*` |
| F-07 | Algolia brands/products indexes | `src/lib/search/algolia.ts` (`BRANDS_INDEX_SETTINGS`, `PRODUCTS_INDEX_SETTINGS`) behind `SearchAdapter` |
| F-08 | Stripe products/prices for 4 plans | `src/lib/plans.ts` (plan matrix) + `src/lib/billing/stripe.ts` behind `BillingAdapter` |
| F-09 | Stripe webhook handler | `src/app/api/stripe/webhook/route.ts` — signature verification, idempotency, subscription transitions (`src/lib/billing/events.ts`) |
| F-10 | Inngest background jobs | `src/lib/jobs/` — test job contract, mock inline runner, `/api/inngest` route |
| F-11 | Resend transactional email | `src/lib/email/` — mock logs instead of sending |
| F-12 | Sentry error tracking | `src/lib/telemetry.ts` — env-gated, optional |
| F-13 | PostHog analytics | `src/lib/telemetry.ts` + provider — env-gated, optional |
| F-14 | Vercel deployment config | `vercel.json`, `.env.example` (full env matrix, zero-key defaults) |
| F-15 | Shared layout: role sidebar | `src/components/layout/` sidebar shell + role-aware dashboard layouts |
| F-16 | Taxonomy seeds | `0003_seed_taxonomy.sql` |
| F-17 | Certifications seeds | `0004_seed_certifications.sql` |

*Deviations documented in the PR: the data model's table set is reconciled with
`audit_log`, `brand_media`, and `processed_webhook_events` (security spec +
ER diagram + webhook idempotency requirement). F-02/F-14 deploy steps are
configuration-only by design — no credentials exist yet and nothing is deployed.*

## CI

GitHub Actions (`.github/workflows/ci.yml`): migrations against a
`postgres:16` service container, then lint, typecheck, tests (unit + RLS),
and a zero-key production build.

## Specs

The complete product specification lives in `docs/specs/` (`00_INDEX` through
`09_TESTING_SPEC`) and is the source of truth.
