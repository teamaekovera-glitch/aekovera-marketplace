# AEKOVERA MARKETPLACE — Specification Package Index

**Project:** Aekovera CPG Brand-to-Buyer Marketplace (RangeMe Competitor)  
**Target Platform:** Obvious Autobuild (app.obvious.ai/autobuild)  
**Specification Version:** 1.0.0  
**Date:** September 2026

---

## Product Summary

A two-sided B2B marketplace that connects CPG brands with retail buyers, distributors, and foodservice operators — modeled on RangeMe but built with structured data, AI-powered matching, and Aekovera's sourcing intelligence as core differentiators. Brands create retailer-ready digital profiles. Buyers publish structured sourcing opportunities. AI scores, matches, and ranks brands against buyer criteria automatically.

---

## File Manifest

| File | Domain | Description |
|------|--------|-------------|
| `00_INDEX.md` | Meta | This file — package overview, reading order, dependency map |
| `01_REQUIREMENTS.md` | Requirements | Functional requirements (brand portal, buyer portal, matching engine, messaging, payments), non-functional requirements, monetization model, success criteria |
| `02_ARCHITECTURE.md` | Architecture | System architecture, tech stack (Next.js/Supabase/Stripe/Algolia), database schema, API contracts, deployment |
| `03_DATA_MODEL.md` | Data | Complete data schemas for brand profiles, product catalogs, buyer profiles, sourcing opportunities, submissions, and all reference tables |
| `04_BRAND_PORTAL_SPEC.md` | Brand UX | Brand onboarding, profile builder, product catalog management, opportunity discovery, submission flow, analytics dashboard |
| `05_BUYER_PORTAL_SPEC.md` | Buyer UX | Buyer onboarding, verification, search/filter/compare, sourcing opportunity creation, submission review pipeline, messaging |
| `06_AI_MATCHING_SPEC.md` | AI/ML | Matching algorithm, scoring engine, profile completeness scoring, AI-generated content, recommendation engine, submission ranking |
| `07_SECURITY_PAYMENTS_SPEC.md` | Security & Payments | Auth, RBAC, RLS policies, Stripe subscription billing, free/paid tier enforcement, PII handling, compliance |
| `08_EXECUTION_PLAN.md` | Planning | 7-phase implementation plan with 70+ tasks, dependency graph, MVP definition |
| `09_TESTING_SPEC.md` | Testing | Testing pyramid, acceptance criteria, edge cases, "Definition of Done" checklist |

---

## Dependencies

```
01_REQUIREMENTS ──────────────────────────────────────────►
       │
       ├──► 02_ARCHITECTURE (implements requirements)
       │         │
       ├──► 03_DATA_MODEL (defines all schemas)
       │         │
       ├──► 04_BRAND_PORTAL_SPEC ──┐
       │                           ├──► 06_AI_MATCHING_SPEC
       ├──► 05_BUYER_PORTAL_SPEC ──┘
       │
       ├──► 07_SECURITY_PAYMENTS_SPEC
       │
       └──► 08_EXECUTION_PLAN ──► 09_TESTING_SPEC
```

---

## Autobuild Ingestion

1. Upload all 10 `.md` files.
2. Set `00_INDEX.md` as root specification.
3. Parse in order: 01 → 09.
4. MVP scope = Phase 0–3 of `08_EXECUTION_PLAN.md`.
5. Final acceptance gate = "Definition of Done" in `09_TESTING_SPEC.md`.
