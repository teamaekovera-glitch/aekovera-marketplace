# REQUIREMENTS.md — Aekovera CPG Marketplace

**Version:** 1.0.0  
**Status:** SPECIFICATION

---

## 1. Product Vision

Build a two-sided B2B marketplace where CPG brands create structured, retailer-ready digital profiles, and retail buyers, distributors, and foodservice operators discover, evaluate, compare, and source brands through AI-powered matching — replacing the manual process of unstructured pitch decks, cold emails, and trade show networking.

**Benchmark:** RangeMe (rangeme.com) — 200K+ brands, 15K+ retail buyers, $99–$399/yr supplier plans.  
**Differentiation:** Deeper structured data, AI-powered scoring and matching, buyer-defined sourcing opportunities with auto-evaluated submissions, and Aekovera's 12K+ supplier intelligence layer.

---

## 2. User Roles

| Role | Description | Portal |
|------|-------------|--------|
| **Brand** | CPG company (founder, sales rep, broker) creating a profile and listing products | Brand Portal |
| **Buyer** | Retailer, distributor, foodservice operator, category manager searching for brands | Buyer Portal |
| **Admin** | Aekovera team managing platform, verifying accounts, moderating content | Admin Dashboard |

---

## 3. Functional Requirements — Brand Portal

### FR-B01: Brand Onboarding
- Brand creates account with email/password or Google OAuth.
- Multi-step onboarding wizard collects: company name, category, HQ location, year founded, website, logo.
- Profile is in "draft" until minimum required fields are completed.
- Profile completeness score displayed as a percentage with actionable prompts.

### FR-B02: Brand Profile
A brand profile MUST capture every data point a retail buyer uses to evaluate a potential supplier. The complete field list is defined in `03_DATA_MODEL.md`. At minimum:

**Company Info:** legal name, DBA, HQ address, year founded, number of employees, annual revenue range, website, social media links, founder name and bio, brand story (rich text), logo, header image, company photos/videos.

**Business Attributes:** ownership diversity (minority/women/veteran-owned — self-reported), certifications held (organic, non-GMO, kosher, halal, SQF, BRC, Fair Trade, B Corp, etc.), insurance coverage (COI on file), FDA registration status, state licenses.

**Distribution & Operations:** current distribution footprint (map of states/regions), fulfillment capabilities (DTC, distributor, direct-to-store, 3PL), warehouse locations, lead time ranges, production capacity, co-manufacturing status (own facility vs. contract).

**Commercial Terms:** wholesale pricing visibility (by request or public), suggested retail price ranges, typical retailer margins, MOQ ranges, payment terms offered, sample availability and policy, trade marketing/promotional support offered.

**Sustainability & Impact:** sustainability certifications, packaging recyclability, carbon footprint data, social impact programs.

### FR-B03: Product Catalog
- Brand can list unlimited products (paid plan) or up to 5 (free plan).
- Each product has: name, description, category/subcategory, images (up to 10), UPC/EAN, case configuration (units per case, case dimensions, case weight), ingredients list, nutrition facts panel (image or structured data), allergen declarations, shelf life, storage requirements, certifications per product, wholesale price per unit, MSRP, available sizes/variants.
- Products are individually searchable and filterable by buyers.

### FR-B04: Opportunity Discovery
- Brand sees a feed of buyer-published "Sourcing Opportunities" relevant to their category and capabilities.
- Filtering by: category, geography, buyer type, certifications required, MOQ, deadline.
- Each opportunity shows: buyer name (if public), requirements summary, submission deadline, fit score (AI-calculated based on brand profile vs. opportunity requirements).

### FR-B05: Submission to Opportunities
- Brand can submit their profile and/or specific products to a sourcing opportunity.
- Submission includes: cover note, selected products, any additional documents.
- **Free brands:** can view opportunities but cannot submit (upgrade prompt).
- **Paid brands:** can submit to unlimited opportunities.
- Brand sees submission status: Submitted → Under Review → Shortlisted / Declined.

### FR-B06: Brand Analytics Dashboard
- Profile views (total, by week, by buyer type).
- Search appearances (how often the brand appeared in buyer searches).
- Opportunity fit scores.
- Profile completeness score with missing-field recommendations.
- Buyer engagement (saves, messages, sample requests received).

---

## 4. Functional Requirements — Buyer Portal

### FR-Y01: Buyer Onboarding & Verification
- Buyer creates account with company email (no free email providers: Gmail, Yahoo, Hotmail blocked for buyer accounts).
- Buyer submits: company name, type (retailer/distributor/foodservice), number of stores/locations, categories bought, geographies served.
- Aekovera admin manually verifies buyer identity before activating buyer privileges (search, messaging, sample requests).
- Verified buyers get a "Verified Buyer" badge.

### FR-Y02: Buyer Profile
- Company name, type, logo, description, website.
- Categories actively sourcing (multi-select from taxonomy).
- Geographies served (states/regions).
- Store count and format (grocery, convenience, specialty, online-only, foodservice).
- Typical price points (value/mid/premium).
- Required certifications for suppliers.
- Margin requirements (ranges).
- Demographics served (if disclosed).
- Preferred supplier attributes (minority-owned, local, organic, etc.).

### FR-Y03: Brand Search & Discovery
- Full-text and faceted search across all published brand profiles and products.
- Filter by: category, subcategory, certifications, geography, distribution capability, MOQ range, production capacity, ownership diversity, shelf life, packaging format, price range.
- Sort by: relevance, profile completeness, newest, AI match score.
- Save search filters as named presets with email notifications for new matching brands.
- Product comparison view: side-by-side comparison of up to 4 products.

### FR-Y04: Brand Evaluation Tools
- Save/favorite brands to a shortlist.
- Add internal notes to any brand (visible only to the buyer's team).
- Request samples from brands (structured form: ship-to address, quantity, specific products).
- Request documents (COI, spec sheets, sell sheets).
- Download brand profile as PDF (one-click export).

### FR-Y05: Sourcing Opportunities (RFP-Style)
- Buyer creates a structured sourcing opportunity with defined requirements:
  - Title and description.
  - Category/subcategory.
  - Required certifications.
  - Geography requirements (supplier location, distribution reach).
  - MOQ range.
  - Target wholesale price range.
  - Margin requirements.
  - Packaging format requirements.
  - Production capacity minimums.
  - Supplier attributes (ownership diversity, etc.).
  - Submission deadline.
  - Visibility: public (all brands can see) or private (invite-only).
- Published opportunities appear in the brand feed.
- Buyer receives structured submissions that are auto-scored against the opportunity requirements (see `06_AI_MATCHING_SPEC.md`).

### FR-Y06: Submission Review Pipeline
- Buyer sees all submissions to their opportunity in a ranked list (highest match score first).
- Each submission shows: brand name, match score breakdown (which requirements met/unmet), product highlights, cover note.
- Buyer can: shortlist, decline (with optional reason), request more info, message brand, request sample.
- Bulk actions: shortlist multiple, decline multiple.
- Export submissions as CSV or PDF report.

### FR-Y07: Messaging
- In-platform messaging between verified buyers and brands.
- Threaded conversations.
- Attachment support (PDF, images).
- Email notification on new messages (configurable).
- Messages are NOT available on free brand plan (upgrade prompt).

---

## 5. Functional Requirements — AI Layer

### FR-A01: Profile Completeness Scoring
- Every brand profile gets a completeness percentage (0–100%).
- Score broken down by section (company info, products, certifications, distribution, commercial terms).
- AI generates specific recommendations: "Add your SQF certification to increase visibility to grocery buyers by 40%."

### FR-A02: Brand-Buyer Matching
- When a buyer searches, AI scores each brand on relevance to the buyer's profile and active search criteria.
- When a brand views opportunities, AI scores each opportunity on fit with the brand's profile.
- Match scores are 0–100 with breakdowns: category fit, geography fit, certification fit, capacity fit, price fit.

### FR-A03: Submission Auto-Evaluation
- When a brand submits to a sourcing opportunity, AI automatically evaluates the brand against every requirement in the opportunity.
- Produces a structured scorecard: requirement → met/partially met/not met → evidence from brand profile.
- Buyer sees submissions ranked by auto-evaluated score.

### FR-A04: AI Content Generation
- AI assists brands in writing profile descriptions, brand stories, and product descriptions from minimal input.
- AI suggests missing fields and generates placeholder content for review.
- AI normalizes data: standardizes certification names, category mappings, unit formats.

### FR-A05: Recommendation Engine
- "Brands You Should Know" — weekly email to buyers with top-matched new brands.
- "Opportunities For You" — weekly email to brands with top-matched new opportunities.
- Homepage featured/trending brands based on buyer engagement signals.

---

## 6. Functional Requirements — Admin

### FR-X01: User Management
- View, search, and manage all brand and buyer accounts.
- Approve/reject buyer verification requests.
- Suspend/ban accounts for policy violations.

### FR-X02: Content Moderation
- Review flagged profiles and products.
- Edit or remove inappropriate content.
- Manage category taxonomy.

### FR-X03: Analytics Dashboard
- Platform metrics: total brands, buyers, products, opportunities, submissions.
- Growth metrics: signups over time, conversion rates (free → paid).
- Engagement: searches, profile views, messages, sample requests.
- Revenue: MRR, churn, plan distribution.

---

## 7. Non-Functional Requirements

### NFR-01: Performance
| Metric | Target |
|--------|--------|
| Page load (LCP) | < 2.5s |
| Search results return | < 500ms |
| API response (p95) | < 300ms |
| Concurrent users supported | 500+ |

### NFR-02: Scalability
- Database must handle 100K+ brand profiles, 1M+ products, 50K+ buyer accounts.
- Search index must handle 10M+ documents with sub-500ms query time.
- File storage for images/documents must scale to 10TB+.

### NFR-03: Security
- All data encrypted in transit (TLS 1.3) and at rest (AES-256).
- Row-Level Security (RLS) on all multi-tenant tables.
- OWASP Top 10 compliance.
- SOC 2 readiness (logging, access control, audit trail).
- PII handling compliant with CCPA and GDPR.

### NFR-04: Availability
- 99.9% uptime.
- Automated backups every 6 hours.
- Disaster recovery: RPO < 6 hours, RTO < 1 hour.

### NFR-05: SEO
- Brand profiles must be server-side rendered (SSR) for search engine indexing.
- Each brand and product gets a unique, crawlable URL.
- Structured data (JSON-LD) for products (Schema.org/Product).
- Sitemap auto-generation.

---

## 8. Monetization Model

### 8.1 Brand Plans

| Feature | Free | Starter ($99/yr) | Pro ($249/yr) | Enterprise ($499/yr) |
|---------|------|-------------------|---------------|----------------------|
| Brand profile | Basic | Full | Full + verified badge | Full + verified + priority |
| Products listed | 5 | Unlimited | Unlimited | Unlimited |
| Search visibility | Low | Standard | Boosted | Priority |
| View sourcing opportunities | Yes | Yes | Yes | Yes |
| Submit to opportunities | No | Up to 10/mo | Unlimited | Unlimited |
| Messaging with buyers | No | Yes | Yes | Yes |
| Analytics dashboard | Basic | Full | Full + buyer insights | Full + competitive intel |
| AI profile optimization | No | Basic | Advanced | Advanced + dedicated |
| Sample request fulfillment | No | Yes | Yes | Priority |
| Profile PDF export | No | Yes | Branded | White-label |

### 8.2 Buyer Plans
- **Free for all verified buyers.** Buyers are the demand side — never gate their access.
- Premium buyer features (v2): advanced analytics, bulk export, API access.

---

## 9. Constraints

- **v1 scope:** US market only (US addresses, USD pricing).
- **No direct purchasing in v1** (discovery and sourcing only — not a transactional marketplace).
- **No mobile app in v1** (responsive web only).
- **Single language: English.**

---

## 10. Success Criteria

| Criterion | Metric | Target (6 months post-launch) |
|-----------|--------|-------------------------------|
| Brand signups | Total registered brands | 1,000 |
| Buyer signups | Total verified buyers | 100 |
| Products listed | Total products across all brands | 10,000 |
| Opportunities published | Total buyer sourcing opportunities | 50 |
| Submissions | Total brand submissions to opportunities | 500 |
| Paid conversion | % of brands on paid plans | 10% |
| Profile completeness | Average brand profile completeness score | 70% |
| Search engagement | Average searches per buyer per month | 15 |
