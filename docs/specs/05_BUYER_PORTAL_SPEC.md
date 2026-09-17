# BUYER_PORTAL_SPEC.md — Buyer-Side UX & Flows

**Version:** 1.0.0  
**Depends on:** `01_REQUIREMENTS.md`, `03_DATA_MODEL.md`

---

## 1. Buyer Onboarding & Verification

```
Step 1: Sign Up
├── Must use company email (block @gmail.com, @yahoo.com, @hotmail.com, @outlook.com)
├── Select role: "I'm a Buyer"
└── Redirect to verification form

Step 2: Company Verification Form
├── Company name
├── Company type (retailer / distributor / foodservice / ecommerce / buying group)
├── Website
├── Number of stores/locations
├── Your title/role
├── Categories you buy (multi-select)
├── Geographies you serve (multi-select US states)
└── Submit for verification

Step 3: Pending Verification
├── Buyer sees: "Your account is under review. We typically verify within 24 hours."
├── Buyer can browse public brand profiles (read-only, no contact info)
├── Buyer CANNOT: search with full filters, message brands, request samples, create opportunities
└── Admin receives notification to review

Step 4: Admin Verification
├── Admin reviews: company website, LinkedIn presence, email domain, company type
├── Admin approves or rejects with reason
├── On approval: buyer gets full access + "Verified Buyer" badge
├── On rejection: buyer gets email with reason + appeal instructions
```

**Verification criteria:**
- Email domain matches company website domain.
- Company website is a real business (not a personal blog or parked domain).
- Company type is plausible for the stated store count.
- LinkedIn company page exists (optional but positive signal).

---

## 2. Buyer Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR                    │  MAIN CONTENT                 │
│                             │                               │
│  ◉ Dashboard                │  ┌────────────────────────┐   │
│  ○ Search Brands            │  │ Quick Stats             │   │
│  ○ Saved Brands             │  │ 12 brands saved         │   │
│  ○ My Opportunities         │  │ 3 active opportunities  │   │
│  ○ Submissions              │  │ 47 submissions received │   │
│  ○ Sample Requests          │  │ 5 pending samples       │   │
│  ○ Messages                 │  └────────────────────────┘   │
│  ○ My Profile               │                               │
│  ○ Settings                 │  ┌────────────────────────┐   │
│                             │  │ Recommended Brands      │   │
│  [Verified Buyer ✓]         │  │ (AI-matched to your     │   │
│                             │  │  profile and categories) │   │
│                             │  └────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Brand Search & Discovery

### 3.1 Search Interface

```
┌──────────────────────────────────────────────────────────────┐
│  🔍 Search brands, products, categories...                    │
│                                                              │
│  FILTERS (left sidebar)          RESULTS (main area)         │
│  ┌──────────────────────┐       ┌──────────────────────────┐ │
│  │ Category              │       │ Showing 234 brands       │ │
│  │ [▼ Beverages      ]   │       │ Sort: [Relevance ▼]      │ │
│  │                       │       │                          │ │
│  │ Subcategory           │       │ ┌────────────────────┐   │ │
│  │ [▼ All             ]  │       │ │ [logo] Acme Foods  │   │ │
│  │                       │       │ │ Organic Snacks     │   │ │
│  │ Certifications        │       │ │ ★ Verified         │   │ │
│  │ ☑ Organic             │       │ │ CA · 12 products   │   │ │
│  │ ☑ Non-GMO             │       │ │ Profile: 89%       │   │ │
│  │ ☐ Kosher              │       │ │ [View] [Save] [📩] │   │ │
│  │ ☐ SQF                 │       │ └────────────────────┘   │ │
│  │                       │       │                          │ │
│  │ Geography             │       │ ┌────────────────────┐   │ │
│  │ [Select states...]    │       │ │ [logo] FreshCo     │   │ │
│  │                       │       │ │ Cold-Pressed Juice │   │ │
│  │ Distribution          │       │ │ NY · 8 products    │   │ │
│  │ ☐ DTC                 │       │ │ Profile: 75%       │   │ │
│  │ ☐ Distributor         │       │ │ [View] [Save]      │   │ │
│  │ ☐ Direct-to-store     │       │ └────────────────────┘   │ │
│  │                       │       │                          │ │
│  │ MOQ Range             │       │                          │ │
│  │ [Min] — [Max]         │       │                          │ │
│  │                       │       │                          │ │
│  │ Ownership             │       │                          │ │
│  │ ☐ Minority-owned      │       │                          │ │
│  │ ☐ Women-owned         │       │                          │ │
│  │ ☐ Veteran-owned       │       │                          │ │
│  │                       │       │                          │ │
│  │ Packaging Format      │       │                          │ │
│  │ ☐ Bottle              │       │                          │ │
│  │ ☐ Pouch               │       │                          │ │
│  │ ☐ Can                 │       │                          │ │
│  │                       │       │                          │ │
│  │ [Save This Search]    │       │                          │ │
│  │ [Clear All]           │       │                          │ │
│  └──────────────────────┘       └──────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Sort options:** Relevance (Algolia default), Profile completeness (highest first), Newest, AI match score (based on buyer profile).

**Saved searches:** Buyer names and saves a filter configuration. Optionally enables email notification: "Notify me when a new brand matches this search" (checked daily via Inngest cron job).

### 3.2 Brand Profile View (Buyer Perspective)

```
┌──────────────────────────────────────────────────────────────┐
│  [Header Image]                                              │
│  ┌──────┐                                                    │
│  │ LOGO │  Acme Natural Foods                                │
│  └──────┘  "Small-batch organic snacks from the Sierra..."   │
│            ★ Verified Brand · Organic · Non-GMO · Women-Owned│
│            📍 Sacramento, CA · Founded 2019                   │
│                                                              │
│  [Save ♡] [Message 📩] [Request Sample 📦] [Download PDF 📄]│
│                                                              │
│  ┌─ Products ──────────────────────────────────────────────┐ │
│  │ [img] Almond Crunch Bar    [img] Oat & Berry Bar        │ │
│  │ $2.49 MSRP · 24/case      $2.99 MSRP · 24/case         │ │
│  │ [Compare ☐]               [Compare ☐]                   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Company Details ───────────────────────────────────────┐ │
│  │ Revenue: $1M–$5M · Employees: 11-50                     │ │
│  │ Facility: Own · Production capacity: 50K units/mo        │ │
│  │ MOQ: 500 units · Lead time: 14-21 days                   │ │
│  │ Payment terms: Net 30 · Samples: Free                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Certifications ───────────────────────────────────────┐  │
│  │ [✓] USDA Organic  [✓] Non-GMO Project  [✓] B Corp      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Distribution Map ─────────────────────────────────────┐  │
│  │ [US state map with highlighted active regions]           │  │
│  │ Available in: CA, OR, WA, NV, AZ · DTC + Distributor    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Internal Notes (only you can see) ────────────────────┐  │
│  │ [Add a note about this brand...]                         │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 3.3 Product Comparison

Buyer selects up to 4 products (checkboxes on search results or brand profiles) → clicks "Compare Selected."

Side-by-side comparison table showing:
- Product image, name, brand
- Category, subcategory
- Price (wholesale, MSRP)
- Case config (units, dimensions, weight)
- Certifications
- Allergens
- Shelf life
- Storage
- MOQ

---

## 4. Sourcing Opportunities

### 4.1 Create Opportunity Flow

```
Step 1: Basic Info
├── Title (e.g. "Looking for Organic Granola Suppliers")
├── Description (rich text, what you're looking for and why)
├── Category + subcategory
└── Visibility: Public / Private (invite-only)

Step 2: Requirements (all optional but improve matching)
├── Certifications required
├── Supplier geography (states)
├── Distribution capability needed
├── MOQ maximum
├── Wholesale price range
├── Margin minimum
├── Packaging format
├── Production capacity minimum
├── Storage type (ambient / refrigerated / frozen)
├── Shelf life minimum
└── Preferred supplier attributes (diversity, local, etc.)

Step 3: Timing
├── Submission deadline
├── Target production start date
└── Review: preview how the opportunity will appear to brands

Step 4: Publish
├── Confirm and publish
└── Opportunity goes live in brand feed
```

### 4.2 Submission Review Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│  "Organic Granola Suppliers" · 23 submissions                │
│                                                              │
│  Sort: [Match Score ▼]  Filter: [All Statuses ▼]            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  95% match  ·  Acme Granola Co.                       │    │
│  │  ✅ Category  ✅ Organic  ✅ Non-GMO  ✅ Geography     │    │
│  │  ✅ MOQ ≤ 2,000  ⚠️ Margin 32% (req: 35%)            │    │
│  │  Products submitted: 3  ·  Cover note: "We specialize…"│    │
│  │  [Shortlist ★] [Decline ✗] [Message 📩] [Sample 📦]  │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  78% match  ·  Nature's Path Bakery                   │    │
│  │  ✅ Category  ✅ Organic  ❌ Non-GMO  ✅ Geography     │    │
│  │  ✅ MOQ  ✅ Margin                                     │    │
│  │  [Shortlist ★] [Decline ✗] [Message 📩]              │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  [Bulk: Shortlist Selected] [Bulk: Decline Selected]        │
│  [Export All Submissions as CSV]                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Messaging

- Buyer can message any published brand (if brand is on a paid plan that includes messaging).
- If brand is on free plan: buyer sees "This brand's messaging is not available on their current plan."
- Threaded conversation per brand-buyer pair.
- Attachments: PDF, JPEG, PNG (max 10MB per file).
- Real-time via Supabase Realtime subscriptions.
- Email fallback: if recipient hasn't read message within 1 hour, send email notification.

---

## 6. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Buyer signs up with @gmail.com | Block registration, show: "Please use your company email address" |
| Buyer fails verification | Email with reason. Buyer can resubmit with updated info. Max 3 attempts. |
| Buyer tries to search before verification | Show limited results (top 10), prompt to complete verification |
| Buyer creates opportunity with no requirements | Allow but warn: "Adding requirements improves submission quality and enables AI matching" |
| Buyer receives 500+ submissions to one opportunity | Pagination (50/page), AI scoring ensures best are at top |
| Buyer declines a submission | Brand sees "Declined" status. Optional decline reason shown to brand. |
| Buyer creates duplicate opportunity | Allow — they may have different requirements for same category |
| Buyer's team member needs access | v1: single user per buyer account. v2: team access with roles |
| Opportunity deadline passes | Status auto-changes to "expired." No new submissions. Buyer can still review existing. |
| Brand submits to expired opportunity | Block with message: "This opportunity has closed" |
| Brand submits to private opportunity without invite | Block — private opportunities only visible to invited brands |
| Buyer exports brand data as PDF | Generated server-side, includes: company info, products, certifications. Excludes: internal buyer notes. |
| Buyer saves same brand twice | Deduplicate silently (UNIQUE constraint) |
| Buyer tries to message brand on free plan | Show message: "This brand hasn't enabled messaging yet." Buyer can still request sample or save. |
| Anonymous user finds brand profile via Google | Can view public profile. All CTAs lead to signup/login. |
