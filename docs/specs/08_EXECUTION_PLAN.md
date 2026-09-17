# EXECUTION_PLAN.md — Phased Implementation Plan

**Version:** 1.0.0  
**Depends on:** All prior specs

---

## 1. Phase Overview

| Phase | Name | Duration | Scope |
|-------|------|----------|-------|
| 0 | Foundation | Week 1-2 | Project scaffold, database, auth, Stripe, Algolia setup |
| 1 | Brand Portal (Core) | Week 3-5 | Brand onboarding, profile builder, product catalog, public pages |
| 2 | Buyer Portal (Core) | Week 5-7 | Buyer onboarding, verification, search, brand discovery |
| 3 | Opportunities & Submissions | Week 7-9 | Sourcing opportunities, brand submissions, AI scoring |
| 4 | Messaging, Analytics & AI | Week 9-11 | In-platform messaging, analytics dashboards, AI features |
| 5 | Payments & Plan Gating | Week 11-12 | Stripe subscriptions, feature gating, upgrade flows |
| 6 | Hardening & Launch | Week 12-14 | Testing, SEO, performance, security audit, production deploy |

**Total estimated duration:** 14 weeks  
**MVP (launchable subset):** Phases 0–3 (Week 1–9)

---

## 2. Phase 0: Foundation (Weeks 1-2)

| ID | Task | Priority | Acceptance Criteria |
|----|------|----------|---------------------|
| F-01 | Initialize Next.js 15 project with App Router, TypeScript, Tailwind, shadcn/ui | P0 | `npm run dev` serves landing page |
| F-02 | Set up Supabase project (PostgreSQL, Auth, Storage) | P0 | Connection established, migrations run |
| F-03 | Create all database tables from `03_DATA_MODEL.md` | P0 | All tables created, all constraints applied, seed categories/subcategories |
| F-04 | Implement RLS policies from `07_SECURITY_PAYMENTS_SPEC.md` | P0 | All RLS policies active, tested with different roles |
| F-05 | Configure Supabase Auth (email/password + Google OAuth) | P0 | Users can sign up, log in, verify email |
| F-06 | Build auth middleware: role detection, redirect logic | P0 | Brand users → /brand/*, buyer users → /buyer/*, admin → /admin/* |
| F-07 | Set up Algolia: create indexes for brands and products | P0 | Indexes created with correct searchable attributes and facets |
| F-08 | Set up Stripe: create products and prices for 4 plans | P0 | Products/prices created in Stripe dashboard |
| F-09 | Set up Stripe webhook handler (checkout, subscription events) | P0 | Webhooks verified with Stripe CLI, plan updates work |
| F-10 | Set up Inngest for background jobs | P1 | Test job runs successfully |
| F-11 | Set up Resend for transactional email | P1 | Welcome email sends on sign-up |
| F-12 | Set up Sentry for error tracking | P1 | Errors captured in Sentry dashboard |
| F-13 | Set up PostHog for product analytics | P2 | Page views tracked |
| F-14 | Configure Vercel deployment with env variables | P0 | `main` branch auto-deploys to staging URL |
| F-15 | Build shared layout: sidebar navigation for brand/buyer/admin | P0 | Layout renders with correct navigation per role |
| F-16 | Seed category/subcategory taxonomy | P0 | All categories from `03_DATA_MODEL.md` seed data loaded |
| F-17 | Seed certifications reference table | P0 | All standard CPG certifications loaded |

---

## 3. Phase 1: Brand Portal — Core (Weeks 3-5)

| ID | Task | Priority | Acceptance Criteria |
|----|------|----------|---------------------|
| B-01 | Brand onboarding wizard (4-step flow) | P0 | New brand completes onboarding, profile created in database |
| B-02 | Brand profile editor: company info section | P0 | Brand can edit all company info fields, data persists |
| B-03 | Brand profile editor: founder section | P1 | Brand can edit founder info, photo upload works |
| B-04 | Brand profile editor: business details section | P0 | Revenue range, employee count, facility info saved |
| B-05 | Brand profile editor: certifications section | P0 | Brand can add/remove certifications, upload certificates |
| B-06 | Brand profile editor: distribution section (US state map) | P0 | Clickable US state map, regions saved to brand_distribution_regions |
| B-07 | Brand profile editor: commercial terms section | P0 | MOQ, lead time, payment terms, sample policy saved |
| B-08 | Brand profile editor: diversity & ownership section | P1 | Self-reported attributes saved |
| B-09 | Brand profile editor: insurance & compliance section | P1 | Insurance, FDA registration saved |
| B-10 | Brand profile editor: sustainability section | P2 | Sustainability attributes saved |
| B-11 | Profile completeness scoring engine | P0 | Score calculates correctly per `06_AI_MATCHING_SPEC.md` algorithm |
| B-12 | Profile completeness UI widget (progress bar + missing fields) | P0 | Widget shows on dashboard and profile editor |
| B-13 | Logo and image upload to Supabase Storage | P0 | Upload, resize, thumbnail generation working |
| B-14 | Product CRUD: create, edit, archive products | P0 | Product form works, data persists, images upload |
| B-15 | Product listing page (brand's own products) | P0 | Brand sees all their products with status filters |
| B-16 | Algolia sync: brand profile → search index on save | P0 | Brand profile changes reflected in Algolia within 5 seconds |
| B-17 | Algolia sync: product → search index on save | P0 | Product changes reflected in Algolia within 5 seconds |
| B-18 | Public brand profile page (SSR, /p/[slug]) | P0 | Server-rendered, includes JSON-LD structured data |
| B-19 | Public product page (SSR, /product/[id]) | P1 | Server-rendered, includes Schema.org/Product |
| B-20 | Brand "Publish Profile" action with minimum completeness check | P0 | Cannot publish below 40% completeness |
| B-21 | Sitemap auto-generation for published brand/product pages | P1 | /sitemap.xml includes all published pages |
| B-22 | Brand dashboard: stats widget (views, search appearances) | P1 | Dashboard shows correct counts |

---

## 4. Phase 2: Buyer Portal — Core (Weeks 5-7)

| ID | Task | Priority | Acceptance Criteria |
|----|------|----------|---------------------|
| Y-01 | Buyer registration with email domain blocking | P0 | Free email domains rejected at sign-up |
| Y-02 | Buyer verification form and pending state | P0 | Form submits, buyer sees pending status |
| Y-03 | Admin verification queue and approve/reject flow | P0 | Admin sees pending buyers, can approve/reject |
| Y-04 | Buyer dashboard layout | P0 | Dashboard renders with navigation |
| Y-05 | Brand search page with Algolia InstantSearch | P0 | Full-text search with faceted filters working |
| Y-06 | Search filters: category, certifications, geography, MOQ, ownership, packaging | P0 | All facets filter correctly |
| Y-07 | Search results: brand cards with name, logo, category, completeness, CTA | P0 | Results render from Algolia |
| Y-08 | Sort options: relevance, completeness, newest | P0 | Sort changes results order |
| Y-09 | Brand profile view page (buyer perspective) | P0 | Buyer sees full published brand profile with action buttons |
| Y-10 | Save/favorite brand | P0 | Brand saved to buyer_saved_brands, appears in "Saved Brands" tab |
| Y-11 | Internal buyer notes on a brand | P1 | Notes saved and displayed, visible only to that buyer |
| Y-12 | Product comparison (up to 4 products side-by-side) | P1 | Comparison table renders with all key fields |
| Y-13 | Saved search presets | P1 | Buyer can name and save a filter configuration, reload it |
| Y-14 | Sample request form | P1 | Buyer fills form, brand receives notification |
| Y-15 | Brand profile PDF export | P2 | Buyer clicks "Download PDF", gets formatted brand summary |

---

## 5. Phase 3: Opportunities & Submissions (Weeks 7-9)

| ID | Task | Priority | Acceptance Criteria |
|----|------|----------|---------------------|
| O-01 | Opportunity creation form (4-step wizard) | P0 | Buyer creates opportunity with all structured requirements |
| O-02 | Opportunity publish flow with preview | P0 | Buyer previews and publishes, opportunity appears in brand feed |
| O-03 | Brand opportunity feed with AI fit scoring | P0 | Brands see opportunities sorted by fit score |
| O-04 | Brand submission flow (select products, write cover note, upload docs) | P0 | Brand submits, data stored in submissions table |
| O-05 | Submission AI auto-evaluation (Inngest background job) | P0 | AI score and breakdown appear within 60 seconds of submission |
| O-06 | Buyer submission review pipeline UI | P0 | Buyer sees ranked submissions with match breakdowns |
| O-07 | Buyer submission actions: shortlist, decline, request info | P0 | Status changes reflect in both buyer and brand views |
| O-08 | Buyer bulk actions (shortlist/decline multiple) | P1 | Bulk actions work correctly |
| O-09 | Opportunity expiration (auto-close past deadline) | P1 | Inngest cron job closes expired opportunities |
| O-10 | Submission CSV export | P1 | Buyer downloads all submissions as CSV |
| O-11 | Free plan gating: brands see opportunities but cannot submit | P0 | Free brands see upgrade prompt on submit button |
| O-12 | Starter plan quota check (10 submissions/month) | P0 | Counter tracks monthly submissions, blocks at limit |

---

## 6. Phase 4: Messaging, Analytics & AI (Weeks 9-11)

| ID | Task | Priority | Acceptance Criteria |
|----|------|----------|---------------------|
| M-01 | Conversation creation (buyer initiates with brand) | P0 | Conversation record created, messages stored |
| M-02 | Message UI: threaded conversation view | P0 | Messages display in order with sender labels |
| M-03 | Real-time message delivery via Supabase Realtime | P0 | Messages appear without page refresh |
| M-04 | Email notification on new message (1-hour delay if unread) | P1 | Email sends via Resend |
| M-05 | Attachment support in messages | P1 | File upload and display in conversation |
| M-06 | Free plan gating: messaging blocked for free brands | P0 | Free brands see upgrade prompt |
| M-07 | Brand analytics: profile views over time chart | P1 | Chart renders with correct data |
| M-08 | Brand analytics: search appearances | P1 | Table shows queries that surfaced the brand |
| M-09 | Brand analytics: engagement metrics (saves, messages, samples) | P1 | Counts displayed on dashboard |
| M-10 | AI: brand story generator | P1 | Claude generates story, brand can edit and save |
| M-11 | AI: cover note drafter | P1 | Claude drafts note in submission flow |
| M-12 | AI: profile completeness recommendations | P1 | AI-generated tips displayed on profile editor |
| M-13 | Recommendation email: "Brands You Should Know" (buyer weekly) | P2 | Inngest cron sends emails to verified buyers |
| M-14 | Recommendation email: "Opportunities For You" (brand weekly) | P2 | Inngest cron sends emails to paid brands |

---

## 7. Phase 5: Payments & Plan Gating (Weeks 11-12)

| ID | Task | Priority | Acceptance Criteria |
|----|------|----------|---------------------|
| P-01 | Stripe Checkout integration for all 3 paid plans | P0 | Brand can upgrade, payment processes, plan updates |
| P-02 | Stripe Customer Portal integration | P0 | Brand can manage subscription, update payment method, cancel |
| P-03 | Upgrade prompt components throughout brand portal | P0 | Upgrade CTAs appear at every gated feature |
| P-04 | Webhook handler: all 5 events from `07_SECURITY_PAYMENTS_SPEC.md` | P0 | All events handled correctly |
| P-05 | Downgrade logic: revoke paid features, retain data | P0 | On cancellation, brand reverts to free plan features |
| P-06 | Billing page in brand settings | P0 | Shows current plan, next billing date, link to Stripe portal |
| P-07 | Product count enforcement (free: 5 max) | P0 | Free brand cannot add 6th product |

---

## 8. Phase 6: Hardening & Launch (Weeks 12-14)

| ID | Task | Priority | Acceptance Criteria |
|----|------|----------|---------------------|
| H-01 | Full test suite passes (see `09_TESTING_SPEC.md`) | P0 | All tests green |
| H-02 | Performance audit: LCP < 2.5s on brand profile pages | P0 | Lighthouse score ≥ 90 |
| H-03 | Security audit: check RLS policies, rate limits, input validation | P0 | No unauthorized access in penetration test |
| H-04 | SEO audit: meta tags, OG images, JSON-LD, sitemap, robots.txt | P0 | Google Search Console validates |
| H-05 | Mobile responsiveness audit (all pages) | P0 | No horizontal scroll, all CTAs tappable |
| H-06 | Error handling: all API errors return proper status codes and messages | P0 | No unhandled exceptions in error monitoring |
| H-07 | Loading states and empty states for all pages | P1 | Skeleton loaders, meaningful empty states |
| H-08 | Terms of Service and Privacy Policy pages | P0 | Legal pages published |
| H-09 | Landing page (marketing, before sign-up) | P0 | Landing page explains value prop, has sign-up CTAs |
| H-10 | Production environment setup (Vercel production, Supabase production) | P0 | Production deployment successful |
| H-11 | Domain configuration and SSL | P0 | Custom domain serving HTTPS |
| H-12 | Monitoring and alerting: Sentry alerts, Vercel uptime | P1 | Alerts configured for errors and downtime |
| H-13 | Admin dashboard: user management, verification queue, content moderation | P0 | Admin can manage all platform entities |
| H-14 | Documentation: API docs, deployment runbook | P1 | Docs cover all critical operations |

---

## 9. Dependency Graph

```
Phase 0 (Foundation)
  │
  ├──► Phase 1 (Brand Portal) ──┐
  │                              ├──► Phase 3 (Opportunities & Submissions)
  ├──► Phase 2 (Buyer Portal) ──┘         │
  │                                        ├──► Phase 4 (Messaging, Analytics, AI)
  │                                        │
  │                                        └──► Phase 5 (Payments & Plan Gating)
  │                                                     │
  └──────────────────────────────────────────────────────┴──► Phase 6 (Hardening)
```

**Phases 1 and 2 can be developed in parallel.**

---

## 10. Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Algolia search index sync delays cause stale results | Medium | Low | Inngest retries + sync status indicator for brands |
| Stripe webhook delivery failures cause plan state drift | High | Low | Idempotent handlers, daily reconciliation job |
| AI scoring produces inconsistent results | Medium | Medium | Deterministic scoring for core match; AI only for summaries |
| Buyer verification bottleneck (manual process) | High | Medium | Build queue UI for admins, consider semi-automated checks (domain verification) |
| RLS misconfiguration leaks data across tenants | Critical | Low | Automated RLS tests in test suite, pre-deploy checks |
| Low initial brand supply (chicken-and-egg problem) | High | High | Seed with Aekovera's 12K+ supplier database, offer free premium trial to early brands |
| Image storage costs grow rapidly | Low | Medium | Compress on upload, enforce size limits, archive unused |
