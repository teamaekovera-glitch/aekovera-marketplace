# TESTING_SPEC.md — Testing Strategy & Definition of Done

**Version:** 1.0.0  
**Depends on:** All prior specs

---

## 1. Testing Pyramid

```
          ┌─────────────┐
          │   E2E (10)   │   Playwright: full user flows
          ├─────────────┤
          │ Integration  │   API routes + DB + Stripe + Algolia
          │    (25)      │
          ├─────────────┤
          │   Unit (80+) │   Components, scoring, utils, hooks
          └─────────────┘
```

**Test framework:** Vitest (unit/integration) + Playwright (E2E)  
**CI:** GitHub Actions runs all tests on every PR

---

## 2. Unit Tests (80+)

### 2.1 Profile Completeness Scoring (15 tests)

| Test | Input | Expected |
|------|-------|----------|
| Empty profile → 0% | No fields filled | score = 0 |
| Company info only → ~20% | Name, story, logo, website filled | score ≈ 20 |
| Full profile → 100% | All fields filled, certifications, products | score = 100 |
| Missing certifications → ~85% | Everything except certifications | score ≈ 85 |
| No products → ~90% | Full profile, no products | score ≈ 90 |
| Partial sections | Half fields in each section | score ≈ 50 |
| Edge: only logo, nothing else | logo_url present, all else null | score ≈ 3 |
| Edge: brand with 0 distribution regions | Empty regions array | distribution section = 0 |
| Single certification counts | 1 cert vs 5 certs | Both get full certification score |
| Product with image vs without | 1 product with image, 1 without | Different product scores |
| Insurance but no FDA | Insurance = true, FDA = false | insurance_compliance ≈ 50% |
| All diversity fields true | All ownership diversity checked | No impact on completeness (not scored) |
| Score updates on save | Save profile → recalculate | Score changes reflected |
| Score never exceeds 100 | All possible fields maxed | score = 100, not > 100 |
| Score never goes below 0 | Unexpected null values | score = 0, not negative |

### 2.2 Match Scoring (15 tests)

| Test | Input | Expected |
|------|-------|----------|
| Perfect match (all criteria met) | Brand matches all opp requirements | total = 100 |
| Zero match (nothing matches) | Brand mismatches every requirement | total close to 0 |
| Category match only | Brand category matches, nothing else | score reflects category weight (25) |
| Partial geography overlap | Brand in 3/5 required states | geography = 60 |
| All certifications met | Brand has all required certs | certifications = 100 |
| Missing 1 of 3 certifications | Brand has 2/3 required certs | certifications ≈ 67 |
| MOQ within limit | Brand MOQ ≤ opportunity max | moq = 100 |
| MOQ exceeds limit by 2x | Brand MOQ = 2x opportunity max | moq ≈ 50 |
| No requirements specified | Opportunity has no filters | total = 100 (all pass) |
| Price within range | Brand price ≤ max | price = 100 |
| Price 20% over range | Brand price = 1.2x max | price = 50 |
| Price way over range | Brand price = 2x max | price = 0 |
| Preferred attributes all met | Brand matches all preferred | preferred = 100 |
| Preferred attributes none met | Brand matches none | preferred = 0 |
| Mixed scores produce correct weighted average | Known inputs | Manually calculated expected total |

### 2.3 UI Component Tests (30 tests)

| Component | Tests |
|-----------|-------|
| `UpgradeGate` | Renders children for paid plan, renders fallback for free plan |
| `ProfileCompletenessWidget` | Renders correct percentage, shows missing fields, shows recommendations |
| `BrandCard` (search result) | Renders name, logo, category, completeness, verified badge |
| `OpportunityCard` | Renders title, deadline, match score with correct color coding |
| `SubmissionScoreBreakdown` | Renders requirement met/unmet icons, correct percentages |
| `ProductComparisonTable` | Renders up to 4 products side-by-side, handles missing fields |
| `USStateMap` | Renders clickable states, reflects saved selections |
| `CategorySelect` | Renders nested categories/subcategories, supports multi-select |
| `FileUpload` | Validates file type, validates file size, shows preview |
| `SearchFilters` | All facets render, clear all resets state, save preset stores filters |

### 2.4 Utility & Hook Tests (20 tests)

| Module | Tests |
|--------|-------|
| `slugify(brandName)` | Handles special characters, spaces, duplicates |
| `formatPrice(cents)` | $0, $1.50, $1,000.00, null → "Contact" |
| `validateEmail(email)` | Valid emails pass, invalid fail |
| `isBlockedEmailDomain(email)` | Blocks gmail, yahoo, hotmail, allows company domains |
| `getPlanFeatures(plan)` | Returns correct feature set for each of 4 plans |
| `canSubmitToOpportunity(plan, monthlyCount)` | Free: false, Starter with 9 used: true, Starter with 10 used: false, Pro: always true |
| `useUser() hook` | Returns user profile with plan, handles loading state |
| `useAlgoliaSync() hook` | Fires sync on save, retries on failure |

---

## 3. Integration Tests (25)

| ID | Test | Scope |
|----|------|-------|
| INT-01 | Brand sign-up flow: register → verify email → onboarding → profile created | Auth + DB |
| INT-02 | Buyer sign-up flow: register → company email check → verification pending | Auth + DB |
| INT-03 | Admin approves buyer → buyer gains verified status and full access | Auth + DB |
| INT-04 | Brand creates profile → Algolia index updated | DB + Algolia |
| INT-05 | Brand creates product → Algolia index updated | DB + Algolia |
| INT-06 | Brand updates profile → Algolia index updated (not duplicated) | DB + Algolia |
| INT-07 | Brand deletes product → removed from Algolia | DB + Algolia |
| INT-08 | Buyer searches → Algolia returns faceted results | Algolia |
| INT-09 | Buyer creates opportunity → visible in brand opportunity feed | DB |
| INT-10 | Brand submits to opportunity → submission created → AI scoring job triggered | DB + Inngest |
| INT-11 | AI scoring job runs → submission gets match score and breakdown | Inngest + Claude API |
| INT-12 | Buyer shortlists submission → status updated → brand notified | DB + Email |
| INT-13 | Buyer declines submission → status updated → brand sees "declined" | DB |
| INT-14 | Stripe checkout session created → payment succeeds → webhook → plan upgraded | Stripe + DB |
| INT-15 | Stripe subscription canceled → webhook → plan downgraded to free | Stripe + DB |
| INT-16 | Stripe payment fails → webhook → status set to past_due → email sent | Stripe + DB + Email |
| INT-17 | Brand on free plan tries to submit → blocked with 403 | API |
| INT-18 | Starter brand at 10 submissions this month tries 11th → blocked | API + DB |
| INT-19 | Message sent → Supabase Realtime delivers to recipient | DB + Realtime |
| INT-20 | Message unread for 1 hour → email notification sent | DB + Inngest + Email |
| INT-21 | RLS: brand cannot read another brand's draft profile | DB + RLS |
| INT-22 | RLS: buyer cannot read buyer profiles | DB + RLS |
| INT-23 | RLS: brand cannot read buyer notes | DB + RLS |
| INT-24 | Rate limit: > 60 searches/minute returns 429 | API |
| INT-25 | File upload: > 5MB rejected, wrong MIME rejected | API + Storage |

---

## 4. End-to-End Tests (10)

All E2E tests use Playwright with test data seeded before each run.

| ID | Test | Steps | Pass Criteria |
|----|------|-------|---------------|
| E2E-01 | Brand full lifecycle | Sign up → onboard → fill profile → add 3 products → publish → verify Algolia has data | Profile page loads at /p/[slug] |
| E2E-02 | Buyer full lifecycle | Sign up (company email) → verify → admin approves → search brands → save brand → add note | Brand appears in buyer's saved list |
| E2E-03 | Opportunity → Submission → Review | Buyer creates opp → brand submits → AI scores → buyer sees ranked list → buyer shortlists | Status = "shortlisted" in both views |
| E2E-04 | Free → Paid upgrade | Brand on free plan → tries to submit (blocked) → upgrades to Starter (Stripe test mode) → submits successfully | Submission created |
| E2E-05 | Messaging flow | Buyer messages brand → brand receives in real-time → brand replies → buyer sees reply | Both sides see full conversation |
| E2E-06 | Search with filters | Buyer searches "organic snacks in California" → filters by certifications, geography, packaging → results match all filters | All results satisfy filter criteria |
| E2E-07 | Profile completeness | Brand starts at ~30% → fills certifications (+15%) → adds products (+10%) → score updates live | Score increases correctly after each addition |
| E2E-08 | Public profile SEO | Navigate to /p/[slug] without auth → page renders → check meta tags, JSON-LD, OG image | All SEO elements present |
| E2E-09 | Opportunity expiration | Create opportunity with deadline 1 minute from now → wait → verify status changes to "expired" → brand cannot submit | Auto-expiration works |
| E2E-10 | Admin moderation | Admin logs in → views verification queue → approves buyer → verifies buyer status updated | Buyer status = "approved" |

---

## 5. Edge Case Coverage

### 5.1 Brand Edge Cases

| Case | Expected Behavior | Test Type |
|------|-------------------|-----------|
| Brand publishes then deletes all products | Profile stays published, shows "No products" | E2E |
| Brand uploads 11th image to a product | Blocked with "Maximum 10 images" | Unit |
| Two brands register with same company name | Both allowed, different slugs auto-generated | Integration |
| Brand's slug conflicts with existing | Auto-append -2, -3, etc. | Unit |
| Brand enters MOQ of 999,999,999 | Accept but AI flags as potential typo | Unit |
| Brand submits to same opportunity twice | Blocked by UNIQUE constraint | Integration |
| Brand on Starter hits 10 submissions, then plan upgrades to Pro mid-month | Counter resets or limit removed immediately | Integration |
| Brand cancels Stripe then resubscribes | Plan reactivates, data intact | Integration |

### 5.2 Buyer Edge Cases

| Case | Expected Behavior | Test Type |
|------|-------------------|-----------|
| Buyer rejected 3 times | Account locked, support contact shown | Integration |
| Buyer creates opportunity with 0 requirements | Allowed with warning, all brands get high match scores | Integration |
| Buyer receives 1000 submissions | Pagination works, AI scoring handles load | Load test |
| Buyer exports 1000 submissions as CSV | CSV downloads within 10 seconds | Integration |
| Buyer saves same brand twice | Deduplicate (UNIQUE constraint, no error to user) | Integration |
| Buyer tries to access /admin/* | 403 redirect to buyer dashboard | Integration |
| Opportunity deadline in the past | Block creation with validation error | Unit |

### 5.3 Security Edge Cases

| Case | Expected Behavior | Test Type |
|------|-------------------|-----------|
| Brand tries to access other brand's profile via API | 403 / empty result (RLS blocks) | Integration |
| Buyer tries to read buyer_profiles table | 403 / empty result (no public read policy) | Integration |
| XSS in brand story field | DOMPurify strips malicious HTML | Unit |
| SQL injection in search query | Parameterized queries prevent injection | Integration |
| Rate limit exceeded on sign-up | 429 response | Integration |
| Expired JWT token used | 401, redirect to login | Integration |

---

## 6. Performance Benchmarks

| Metric | Target | Tool |
|--------|--------|------|
| Brand profile page LCP | < 2.5s | Lighthouse |
| Brand search results (Algolia) | < 500ms | Algolia dashboard |
| API response (p95) | < 300ms | Vercel analytics |
| AI scoring job completion | < 30s | Inngest dashboard |
| AI content generation | < 10s | Application timer |
| Algolia index sync latency | < 5s | Custom monitoring |
| Brand profile page Lighthouse score | ≥ 90 | Lighthouse |

---

## 7. Definition of Done

The build is complete ONLY when ALL items in this checklist pass:

### 7.1 Functional Completeness
- [ ] Brand can sign up, complete onboarding, fill full profile, add products, publish
- [ ] Buyer can sign up, get verified, search brands, save/compare, create opportunities
- [ ] Brands can discover opportunities, submit with products and cover note
- [ ] Buyer sees AI-scored, ranked submissions and can shortlist/decline
- [ ] In-platform messaging works between verified buyers and paid brands
- [ ] Brand analytics show profile views, search appearances, engagement metrics
- [ ] Stripe subscriptions work for all 4 plans (free/starter/pro/enterprise)
- [ ] Feature gating enforced at API and UI layers for all plan differences
- [ ] Admin can verify buyers, moderate content, view platform metrics

### 7.2 Quality
- [ ] All 80+ unit tests pass (0 failures)
- [ ] All 25 integration tests pass (0 failures)
- [ ] All 10 E2E tests pass (0 failures)
- [ ] No critical or high-severity Sentry errors in 24-hour soak test
- [ ] Lighthouse performance score ≥ 90 on brand profile pages
- [ ] All pages responsive (mobile, tablet, desktop)
- [ ] All loading states and empty states implemented
- [ ] Error messages are user-friendly (no raw error codes)

### 7.3 Security
- [ ] All RLS policies tested and verified (no cross-tenant data leakage)
- [ ] Rate limiting active on all public endpoints
- [ ] File upload validation: type, size, MIME check
- [ ] No Supabase service role key exposed to client
- [ ] HTTPS enforced, no mixed content
- [ ] Input validation (Zod) on all API endpoints

### 7.4 SEO & Public Access
- [ ] Brand profile pages are server-rendered (SSR)
- [ ] JSON-LD structured data on brand and product pages
- [ ] Sitemap auto-generated and registered with Google Search Console
- [ ] OG meta tags render correct images and descriptions
- [ ] robots.txt configured correctly

### 7.5 Billing
- [ ] All 5 Stripe webhook events handled idempotently
- [ ] Plan upgrades reflect immediately in feature access
- [ ] Plan downgrades retain data, revoke features
- [ ] Stripe Customer Portal accessible from brand settings

### 7.6 Operations
- [ ] Production deployment on Vercel + Supabase Cloud
- [ ] Custom domain configured with SSL
- [ ] Sentry error monitoring active
- [ ] PostHog analytics tracking active
- [ ] Database backups configured (Supabase automatic)
- [ ] Deployment runbook documented
