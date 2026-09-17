# Phase 0 Delivery Report — Marketplace Foundation

Status: **Complete — PR #1, CI green, awaiting merge.** This report summarizes everything the
foundation phase created, the workflows that verify it, the evidence, and what comes next.
It complements (and links from) the PR #1 description.

Scope delivered: F-01 through F-17 of `docs/specs/08_execution_plan.md` — the full foundation
for the Aekovera CPG Marketplace, a two-sided B2B marketplace (CPG brands ↔ verified retail buyers).

---

## 1. Executive summary

The foundation makes three things true simultaneously:

1. **The app builds, boots, and demos with zero API keys.** Every external service —
   Supabase Auth, Algolia, Stripe, Inngest, Resend, Sentry, PostHog — sits behind a typed
   adapter whose factory consults `serviceMode` (`src/lib/env.ts`). With no credentials,
   mock implementations serve every call. Real keys later drop into `.env` with **no code
   changes** — the load-bearing decision for the whole delivery.
2. **Tenant isolation is proven, not assumed.** A 22-table PostgreSQL schema with 34
   Row-Level Security policies, exercised by 26 dedicated RLS isolation assertions that
   run in CI on PostgreSQL 16.
3. **Every push is gated.** A GitHub Actions workflow applies the migrations to a real
   Postgres 16 service container, then runs lint → typecheck → tests → zero-key build.
   The same gate passes locally and in CI.

## 2. What was created, layer by layer

| Layer | What exists | Where |
| --- | --- | --- |
| App scaffold | Next.js 15 App Router, TypeScript strict, Tailwind, customized shadcn/ui, ESLint flat config, landing page | root configs, `src/app/`, `src/components/ui/` |
| Database | 22-table schema (union of spec sources), constraints, indexes, triggers | `supabase/migrations/0001_init.sql` |
| RLS | 34 policies across all tables; Supabase-compat roles (`anon`/`authenticated`/`service_role`), `auth.uid()` JWT-claim readers, service_role BYPASSRLS — all `if not exists` so platform objects win in production | `supabase/migrations/0002_rls.sql` |
| Migrations | 4 numbered plain-SQL migrations with a transactional runner | `supabase/migrations/`, `supabase/migrate.mjs` |
| Seeds | CPG taxonomy (4 categories, 24 subcategories) + 18 reference certifications | `0003_seed_taxonomy.sql`, `0004_seed_certifications.sql` |
| Auth | Supabase SSR adapter + mock adapter (seeded brand/buyer/admin demo accounts) behind `AuthAdapter`; email/password + Google OAuth pattern | `src/lib/auth/supabase.ts` |
| Role routing | Middleware reads the session and routes `/brand/*`, `/buyer/*`, `/admin/*`; unauthenticated → 307 `/signin` | `middleware.ts`, `src/lib/session-cookie.ts` |
| Search | Algolia brands/products indexes behind `SearchAdapter` (mock fallback when keyless) | `src/lib/search/algolia.ts` |
| Billing | Plan matrix — Free / Starter $99 / Pro $249 / Enterprise $499 (yearly) — gating helpers, Stripe adapter, webhook handler with signature verification, event normalization, pure subscription-transition logic, event-id idempotency | `src/lib/plans.ts`, `src/lib/billing/`, `src/app/api/webhooks/stripe/route.ts` |
| Background jobs | Inngest wiring + `/api/inngest` route behind the jobs adapter | `src/lib/jobs/` |
| Email | Resend transactional email behind the email adapter | `src/lib/email/` |
| Telemetry | Sentry + PostHog, env-gated and optional | `src/lib/telemetry.ts` |
| Shared layout | Role sidebar + `(app)` layouts used by all three portals | `src/components/layout/role-sidebar.tsx` |
| Deploy config | `vercel.json`, complete `.env.example` matrix (config-only — no credentials exist, nothing deployed) | `vercel.json`, `.env.example` |
| Webhooks | `processed_webhook_events` table for durable event-id dedupe (security spec §5) | `0001_init.sql` |
| Audit | `audit_log` table | `0001_init.sql` |
| CI | One-gate workflow (see §3) | `.github/workflows/ci.yml` |

## 3. Workflows

### 3.1 CI — `.github/workflows/ci.yml` (the one gate)

| Property | Value |
| --- | --- |
| Triggers | `pull_request` → `main`, `push` → `main` |
| Runner | `ubuntu-latest` |
| Database | `postgres:16` service container (`postgres/postgres`, db `aekovera_test`, health-gated via `pg_isready`) |
| Node | 22, with npm cache |
| Env | `DATABASE_URL` + `TEST_DATABASE_URL` pointing at the service container |

Pipeline steps, in order:

1. `actions/checkout@v4`
2. `actions/setup-node@v4` (Node 22, npm cache)
3. `npm ci`
4. **Migrations** — `node supabase/migrate.mjs` applies all four migrations to PostgreSQL 16 (proves they run on the platform engine, not just in tests)
5. **Lint** — `npm run lint`
6. **Typecheck** — `npm run typecheck`
7. **Tests** — `npm test` (unit + RLS isolation; see §4)
8. **Build** — `npm run build` with **zero env keys** (proves the mock-first contract)

A red step anywhere blocks merge. All Phase 1/2 PRs inherit this gate unchanged.

### 3.2 Why migrations run in CI

Applying migrations against a real `postgres:16` container — rather than mocking the
database — is what makes the RLS tests meaningful: policies are evaluated by the actual
engine for the actual roles. This is the mechanism that turns "we wrote 34 policies" into
"34 policies demonstrably isolate tenants" (§4).

### 3.3 Future workflows

The delivery intentionally ships exactly one workflow. The execution plan's later phases
reuse this gate; a visual/e2e workflow (Playwright, per `docs/specs/09_testing_spec.md`)
and a preview-deploy workflow land with the UI phases, when there are screens to capture.

## 4. Test evidence

- `npm run lint` — clean; `npm run typecheck` — clean
- `npx vitest run` — **57/57 passing** (26 RLS isolation assertions + 31 unit tests)
- `npm run build` — succeeds with zero env keys
- Migrations apply cleanly to PostgreSQL 16.15; seeds verified in-DB (4 categories,
  24 subcategories, 18 `certifications_reference` rows, 34 policies)
- Dev server zero-key boot: landing 200, `/signin` 200, unauthenticated `/brand` + `/buyer`
  → 307 `/signin`, `/api/health` reports all services `mock` with no warnings

**How the RLS tests work:** the client roles are `NOLOGIN` (Supabase manages them on the
platform), so tests use superuser `SET ROLE` — PostgreSQL evaluates RLS against the
effective role, and a hygiene test pins `current_user`. Fixtures: `tests/rls-seed.sql`.

## 5. Documented deviations from the spec sources

The spec's own table lists disagree with each other; the implementation follows the union:

- `03_data_model.md` defines 19 tables; `07_security_payments_spec.md` adds `audit_log`;
  the ER diagram references `brand_media` (defined nowhere); webhook idempotency requires
  durable dedupe storage → **22-table union implemented**, no spec'd table dropped.
- The task brief said "16-table schema" — the count in the specs is 19 before the security
  additions; the full union ships.
- F-02 (Supabase project) and F-14 (deploy) are **deploy-time config only** — no credentials
  exist yet; compat shims in `0001` mean Supabase's own objects win on the platform.

## 6. How to run

```bash
cp .env.example .env   # or don't — the app boots with zero keys
npm ci
node supabase/migrate.mjs
npm run dev            # landing 200; role middleware 307s; /api/health all-mock
npm test               # 57/57
```

## 7. What comes next

- **Phase 1 (Brand Portal)** and **Phase 2 (Buyer Portal + Admin)** branch from this
  foundation and run in parallel; both inherit this CI gate.
- **UI polish pass** follows the functional MVP per the UI Polish Brief (design tokens,
  five global states, mobile layouts, WCAG 2.1 AA, Lighthouse ≥ 90).
