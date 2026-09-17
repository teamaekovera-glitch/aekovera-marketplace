# ARCHITECTURE.md — System Architecture & Tech Stack

**Version:** 1.0.0  
**Depends on:** `01_REQUIREMENTS.md`

---

## 1. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                     AEKOVERA MARKETPLACE                           │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    PRESENTATION LAYER                        │  │
│  │                                                              │  │
│  │  Next.js 15 (App Router, RSC, Server Actions)                │  │
│  │  ├── /brand/*       Brand portal pages                       │  │
│  │  ├── /buyer/*       Buyer portal pages                       │  │
│  │  ├── /admin/*       Admin dashboard                          │  │
│  │  ├── /p/[slug]      Public brand profile (SSR, SEO)          │  │
│  │  └── /product/[id]  Public product page (SSR, SEO)           │  │
│  │                                                              │  │
│  │  Tailwind CSS + shadcn/ui                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│                              ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    APPLICATION LAYER                          │  │
│  │                                                              │  │
│  │  Next.js API Routes + Server Actions                         │  │
│  │  ├── Auth (Supabase Auth / Clerk)                            │  │
│  │  ├── Brand CRUD                                              │  │
│  │  ├── Product CRUD                                            │  │
│  │  ├── Buyer CRUD                                              │  │
│  │  ├── Opportunity CRUD                                        │  │
│  │  ├── Submission CRUD                                         │  │
│  │  ├── Messaging                                               │  │
│  │  ├── Search (delegates to Algolia)                           │  │
│  │  └── AI Services (delegates to Claude API)                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                     │
│                    ┌─────────┼──────────┐                          │
│                    ▼         ▼          ▼                          │
│  ┌────────────┐ ┌────────┐ ┌─────────────┐ ┌───────────────────┐  │
│  │ Supabase   │ │Algolia │ │ Supabase    │ │ Claude API        │  │
│  │ PostgreSQL │ │ Search │ │ Storage     │ │ (Sonnet 4.6)      │  │
│  │ + RLS      │ │ Index  │ │ (S3-compat) │ │                   │  │
│  │            │ │        │ │ Images/Docs │ │ - Matching         │  │
│  │ - Users    │ │ Brands │ │             │ │ - Scoring          │  │
│  │ - Brands   │ │Products│ │             │ │ - Content gen      │  │
│  │ - Products │ │        │ │             │ │ - Normalization    │  │
│  │ - Buyers   │ │        │ │             │ │                   │  │
│  │ - Opps     │ │        │ │             │ │                   │  │
│  │ - Messages │ │        │ │             │ │                   │  │
│  └────────────┘ └────────┘ └─────────────┘ └───────────────────┘  │
│                              │                                     │
│                              ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    PAYMENTS & BILLING                         │  │
│  │  Stripe Checkout + Customer Portal + Webhooks                │  │
│  │  Plans: Free / Starter / Pro / Enterprise                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    BACKGROUND JOBS                            │  │
│  │  Inngest (or Supabase Edge Functions + pg_cron)              │  │
│  │  ├── Search index sync (brand/product → Algolia)             │  │
│  │  ├── Weekly recommendation emails                            │  │
│  │  ├── Profile completeness recalculation                      │  │
│  │  ├── Submission auto-scoring                                 │  │
│  │  └── Scheduled opportunity expiration                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    OBSERVABILITY                              │  │
│  │  Vercel Analytics + Sentry + PostHog                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 15 (App Router, React Server Components) | SSR for SEO on brand/product pages, server actions for mutations, excellent DX |
| **Styling** | Tailwind CSS + shadcn/ui | Consistent component library, fast to build, accessible defaults |
| **Auth** | Supabase Auth (email/password + Google OAuth) | Integrated with Supabase RLS, supports role-based access |
| **Database** | Supabase (PostgreSQL 16 with RLS) | Managed Postgres, row-level security for multi-tenant isolation, real-time subscriptions for messaging |
| **Search** | Algolia | Sub-100ms faceted search, typo tolerance, facet filters for every brand/product attribute |
| **File Storage** | Supabase Storage (S3-compatible) | Images, documents, logos. Integrated with Supabase auth policies |
| **Payments** | Stripe (Checkout + Customer Portal + Webhooks) | Industry standard for SaaS subscriptions, handles plan upgrades/downgrades/cancellations |
| **AI** | Anthropic Claude Sonnet 4.6 API | Matching, scoring, content generation, data normalization |
| **Background Jobs** | Inngest | Event-driven job queue: search sync, emails, scoring, cron tasks |
| **Email** | Resend (transactional) | Welcome emails, notifications, weekly digests, password reset |
| **Analytics** | PostHog (product analytics) + Vercel Analytics (web vitals) | Funnel tracking, feature usage, A/B testing |
| **Error Tracking** | Sentry | Error monitoring, performance tracing |
| **Hosting** | Vercel (frontend) + Supabase Cloud (backend) | Zero-config deployment, edge CDN, managed database |

---

## 3. Key Architectural Decisions

### 3.1 SSR for Public Profiles
Brand profiles (`/p/[slug]`) and product pages (`/product/[id]`) are server-side rendered using Next.js RSC for SEO. These pages include JSON-LD structured data (Schema.org/Organization, Schema.org/Product) and are included in an auto-generated sitemap.

### 3.2 Row-Level Security (RLS)
Every database table has RLS policies. A brand can only read/write their own data. A buyer can read published brand profiles but not drafts. Admin can access everything. RLS is the primary security mechanism — the application layer does not bypass it.

### 3.3 Search Index Sync
When a brand profile or product is created/updated, an Inngest event fires to sync the record to Algolia. The Algolia index is the source of truth for search. PostgreSQL is the source of truth for all data. Reads for search go to Algolia; reads for profile display go to PostgreSQL.

### 3.4 AI as a Service Layer
All AI features (matching, scoring, content generation) call Claude API via a thin service layer. AI calls are async background jobs for scoring (not blocking UI). Content generation is synchronous (user waits for result).

### 3.5 Feature Gating by Plan
Feature access is enforced at both the API and UI layers. The user's current Stripe subscription determines their plan. Plan checks happen in middleware (server-side) and in UI components (client-side, for showing upgrade prompts). Stripe is the source of truth for subscription state.

---

## 4. Deployment

```
┌──────────────────┐     ┌──────────────────────────┐
│  Vercel           │     │  Supabase Cloud           │
│  ├── Next.js app  │────►│  ├── PostgreSQL 16        │
│  ├── Edge CDN     │     │  ├── Auth                 │
│  ├── Serverless   │     │  ├── Storage (S3)         │
│  │   functions    │     │  ├── Realtime (WebSocket)  │
│  └── Cron (Inngest│     │  └── Edge Functions       │
│       webhook)    │     └──────────────────────────┘
└──────────────────┘
         │
         ├──► Algolia (search index)
         ├──► Stripe (payments)
         ├──► Resend (email)
         ├──► Anthropic (AI)
         ├──► Sentry (errors)
         └──► PostHog (analytics)
```

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ALGOLIA_APP_ID=
ALGOLIA_ADMIN_API_KEY=
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```
