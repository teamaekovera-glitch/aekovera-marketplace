# BRAND_PORTAL_SPEC.md — Brand-Side UX & Flows

**Version:** 1.0.0  
**Depends on:** `01_REQUIREMENTS.md`, `03_DATA_MODEL.md`

---

## 1. Brand Onboarding Flow

```
Step 1: Sign Up
├── Email/password or Google OAuth
├── Select role: "I'm a Brand" / "I'm a Buyer"
└── Redirect to onboarding wizard

Step 2: Company Basics (required to proceed)
├── Company name
├── Brand name (if different)
├── Category (select from taxonomy)
├── HQ state
├── Website URL
└── Logo upload

Step 3: Product Quick-Add (optional, skippable)
├── Add 1 product: name, image, category
└── Skip to complete later

Step 4: Profile Preview
├── Show how profile will appear to buyers
├── Profile completeness score (will be low — ~30%)
├── CTA: "Complete your profile to get discovered"
└── Redirect to brand dashboard
```

**Post-onboarding:** Profile is in `draft` status. It becomes `published` only when the brand explicitly clicks "Publish Profile" AND completeness score is ≥ 40% (minimum: company info + 1 product + category).

---

## 2. Brand Dashboard

### 2.1 Layout

```
┌──────────────────────────────────────────────────────────────┐
│  SIDEBAR                    │  MAIN CONTENT                  │
│                             │                                │
│  ◉ Dashboard                │  ┌─────────────────────────┐   │
│  ○ My Profile               │  │ Profile Completeness    │   │
│  ○ Products                 │  │ ████████░░ 72%          │   │
│  ○ Opportunities            │  │ Missing: certifications, │   │
│  ○ My Submissions           │  │ commercial terms         │   │
│  ○ Messages                 │  └─────────────────────────┘   │
│  ○ Analytics                │                                │
│  ○ Settings                 │  ┌─────────────────────────┐   │
│  ○ Billing                  │  │ This Week               │   │
│                             │  │ 23 profile views        │   │
│  ┌──────────────────────┐   │  │ 4 search appearances    │   │
│  │ Plan: Free            │   │  │ 1 sample request        │   │
│  │ [Upgrade to Starter]  │   │  │ 2 new opportunities     │   │
│  └──────────────────────┘   │  └─────────────────────────┘   │
│                             │                                │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Profile Editor

Multi-section form with tab navigation and inline save. Sections:

| Section | Fields | Completion Weight |
|---------|--------|-------------------|
| Company Info | Name, story, tagline, HQ, website, socials, logo, header | 20% |
| Founder & Team | Name, title, bio, photo | 5% |
| Business Details | Revenue range, employee count, business type, facility info | 10% |
| Certifications | All certifications with certificate uploads | 15% |
| Distribution | States map (clickable US map), fulfillment capabilities | 15% |
| Commercial Terms | MOQ, lead time, payment terms, sample policy, trade support | 15% |
| Diversity & Ownership | Self-reported diversity attributes | 5% |
| Insurance & Compliance | Liability insurance, FDA registration | 10% |
| Sustainability | Statement, packaging, carbon, social impact | 5% |

**AI Assist Features:**
- "Generate brand story" button: Claude generates brand story from company name, category, and any existing data.
- "Complete this section" suggestion: when a section is < 50%, show AI-generated suggestions.
- Missing-field alerts: "Buyers in your category search for [certification] — add it to increase visibility."

### 2.3 Product Management

| Action | Free Plan | Paid Plan |
|--------|-----------|-----------|
| Add product | Up to 5 | Unlimited |
| Edit product | Yes | Yes |
| Archive product | Yes | Yes |
| Bulk import (CSV) | No | Yes |

**Product editor fields:** (see `03_DATA_MODEL.md` products table for full list)

**Image upload rules:**
- Minimum 1 image per product (hero image).
- Up to 10 images per product.
- Accepted formats: JPEG, PNG, WebP.
- Max file size: 5MB per image.
- Auto-resize to 1200x1200 max, maintain aspect ratio.
- Generate thumbnails (300x300) on upload.

---

## 3. Opportunity Discovery

### 3.1 Opportunity Feed

```
┌─────────────────────────────────────────────────────────┐
│  SOURCING OPPORTUNITIES                    [Filters ▼]  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  🟢 95% match                                    │    │
│  │  "Organic Snack Bars for Midwest Distributor"    │    │
│  │  Category: Snacks · Deadline: Oct 15, 2026       │    │
│  │  Certifications: Organic, Non-GMO                │    │
│  │  MOQ: ≤ 5,000 units · Margin: ≥ 35%             │    │
│  │  [View Details]  [Submit ▶]                      │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  🟡 68% match                                    │    │
│  │  "Private Label Hot Sauce Line"                  │    │
│  │  Category: Condiments · Deadline: Nov 1, 2026    │    │
│  │  Certifications: SQF                             │    │
│  │  [View Details]  [🔒 Upgrade to Submit]          │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Match score colors:** 🟢 80–100%, 🟡 50–79%, 🔴 < 50%.

**Filters:** category, geography, deadline (upcoming/this month/all), match score (high/medium/all), certifications required.

### 3.2 Submission Flow

1. Brand clicks "Submit" on an opportunity.
2. **Plan check:** Free brands see upgrade prompt. Starter brands check monthly quota (10/mo).
3. Brand selects which products to include (from their catalog).
4. Brand writes cover note (optional, AI can draft one).
5. Brand uploads additional documents (optional: sell sheet, spec sheet, COI).
6. Brand reviews and confirms submission.
7. System runs AI scoring (async — score appears within 60 seconds).
8. Brand sees submission status in "My Submissions" tab.

---

## 4. Brand Analytics

| Metric | Free | Paid |
|--------|------|------|
| Total profile views | ✓ | ✓ |
| Views over time (chart) | ✗ | ✓ |
| Search appearances | ✗ | ✓ |
| Top search queries that surfaced your profile | ✗ | ✓ |
| Buyer engagement (saves, messages, samples) | ✗ | ✓ |
| Opportunity fit scores | ✓ | ✓ |
| Profile completeness breakdown | ✓ | ✓ |

---

## 5. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Brand tries to publish with < 40% completeness | Block publish, show missing required fields |
| Brand on free plan tries to add 6th product | Show upgrade prompt, do not allow |
| Brand on free plan tries to submit to opportunity | Show upgrade prompt with value prop |
| Brand on free plan tries to message buyer | Show upgrade prompt |
| Brand uploads image > 5MB | Client-side validation, reject with message |
| Brand uploads non-image file as product image | Server-side MIME check, reject |
| Brand enters duplicate UPC | Warn but allow (same brand, different variants) |
| Brand with no products tries to submit to opportunity | Block submission, prompt to add products first |
| Brand deletes all products after publishing | Profile stays published but shows "No products listed" |
| Brand's Stripe subscription lapses | Downgrade to free plan features, keep data, show reactivation prompt |
| Two brands claim same company name | Allow — names are not unique. Slug is unique. |
| Brand uploads a fake certification | Admin can revoke verification; buyer sees "unverified" tag |
| Brand profile viewed by anonymous (non-logged-in) user | Public profiles are viewable. Contact info hidden. CTA to sign up as buyer. |
