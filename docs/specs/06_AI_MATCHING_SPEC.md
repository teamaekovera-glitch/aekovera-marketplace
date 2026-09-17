# AI_MATCHING_SPEC.md — AI Matching, Scoring & Recommendation Engine

**Version:** 1.0.0  
**Depends on:** `01_REQUIREMENTS.md`, `03_DATA_MODEL.md`

---

## 1. Overview

The AI layer serves five functions:
1. **Profile Completeness Scoring** — Tell brands what's missing and why it matters.
2. **Brand-Buyer Match Scoring** — Score brands against buyer search criteria and buyer profile.
3. **Submission Auto-Evaluation** — Score brand submissions against opportunity requirements.
4. **Content Generation** — Help brands write profiles and cover notes.
5. **Recommendations** — Surface relevant brands to buyers and opportunities to brands.

---

## 2. Profile Completeness Scoring

### 2.1 Algorithm

Deterministic scoring — no AI needed. Pure rule-based calculation.

```python
COMPLETENESS_WEIGHTS = {
    "company_info": {
        "weight": 20,
        "fields": {
            "brand_name": 3, "brand_story": 4, "tagline": 1,
            "hq_city": 2, "hq_state": 2, "website": 3,
            "logo_url": 3, "header_image_url": 2,
        }
    },
    "founder": {
        "weight": 5,
        "fields": {"founder_name": 2, "founder_bio": 2, "founder_photo_url": 1}
    },
    "business_details": {
        "weight": 10,
        "fields": {
            "annual_revenue_range": 3, "employee_count_range": 2,
            "business_type": 2, "owns_facility": 1, "production_capacity_notes": 2,
        }
    },
    "certifications": {
        "weight": 15,
        "fields": {"has_any_certification": 15}  # Boolean: ≥ 1 certification = full score
    },
    "distribution": {
        "weight": 15,
        "fields": {"has_distribution_regions": 8, "fulfillment_capabilities": 7}
    },
    "commercial_terms": {
        "weight": 15,
        "fields": {
            "moq_minimum": 3, "lead_time_days_min": 3, "payment_terms": 3,
            "sample_policy": 3, "trade_marketing_support": 3,
        }
    },
    "products": {
        "weight": 10,
        "fields": {"has_any_published_product": 5, "product_with_image": 3, "product_with_upc": 2}
    },
    "insurance_compliance": {
        "weight": 10,
        "fields": {"has_product_liability_insurance": 5, "fda_registered": 5}
    },
}

def calculate_completeness(brand_profile, products, certifications, regions):
    total_score = 0
    breakdown = {}
    
    for section, config in COMPLETENESS_WEIGHTS.items():
        section_points = 0
        section_max = sum(config["fields"].values())
        
        for field, points in config["fields"].items():
            if field_is_filled(brand_profile, products, certifications, regions, field):
                section_points += points
        
        section_pct = (section_points / section_max) * config["weight"]
        total_score += section_pct
        breakdown[section] = round(section_pct / config["weight"] * 100)
    
    return round(total_score), breakdown
```

### 2.2 AI Recommendations

After calculating completeness, call Claude to generate 3 actionable recommendations:

```
System: You are a CPG retail-readiness advisor. Given a brand's profile completeness 
breakdown, generate 3 short, specific recommendations for improving their visibility 
to retail buyers. Each recommendation should be 1-2 sentences, actionable, and 
reference a specific missing field or section. Quantify the impact where possible.

User: Brand: {brand_name}, Category: {category}
Completeness: {score}%
Sections: {breakdown}
Missing fields: {missing_fields_list}

Generate 3 recommendations.
```

**Example output:** "Add your USDA Organic certification — 68% of grocery buyers in your category filter for organic. This alone could double your search appearances."

---

## 3. Brand-Buyer Match Scoring

### 3.1 When It Runs
- When a buyer searches: each result gets a match score against the buyer's search filters AND their buyer profile.
- When a brand views opportunities: each opportunity gets a fit score against the brand's profile.

### 3.2 Scoring Algorithm

```python
def score_brand_for_opportunity(brand, opportunity):
    """
    Score a brand's fit for a specific opportunity.
    Returns 0-100 with breakdown.
    """
    scores = {}
    weights = {}
    
    # Category fit (required)
    weights["category"] = 25
    if opportunity.required_category_id:
        if brand_has_products_in_category(brand, opportunity.required_category_id):
            scores["category"] = 100
        elif brand_has_products_in_parent_category(brand, opportunity.required_category_id):
            scores["category"] = 50
        else:
            scores["category"] = 0
    else:
        scores["category"] = 100  # No category requirement = automatic pass
    
    # Geography fit
    weights["geography"] = 20
    if opportunity.required_geography:
        overlap = set(brand.distribution_regions) & set(opportunity.required_geography)
        scores["geography"] = (len(overlap) / len(opportunity.required_geography)) * 100
    else:
        scores["geography"] = 100
    
    # Certification fit
    weights["certifications"] = 20
    if opportunity.required_certifications:
        brand_certs = set(brand.certification_codes)
        required_certs = set(opportunity.required_certifications)
        met = brand_certs & required_certs
        scores["certifications"] = (len(met) / len(required_certs)) * 100
    else:
        scores["certifications"] = 100
    
    # MOQ fit
    weights["moq"] = 10
    if opportunity.required_moq_max and brand.moq_minimum:
        if brand.moq_minimum <= opportunity.required_moq_max:
            scores["moq"] = 100
        else:
            # Partial credit: how close
            ratio = opportunity.required_moq_max / brand.moq_minimum
            scores["moq"] = max(0, ratio * 100)
    else:
        scores["moq"] = 100
    
    # Price fit
    weights["price"] = 10
    if opportunity.required_price_range_max_cents and brand_avg_wholesale_price(brand):
        avg_price = brand_avg_wholesale_price(brand)
        if avg_price <= opportunity.required_price_range_max_cents:
            scores["price"] = 100
        elif avg_price <= opportunity.required_price_range_max_cents * 1.2:
            scores["price"] = 50  # Within 20% over
        else:
            scores["price"] = 0
    else:
        scores["price"] = 100
    
    # Capacity fit
    weights["capacity"] = 10
    if opportunity.required_production_capacity_min:
        # Use brand's stated capacity or infer from revenue range
        scores["capacity"] = 100 if brand_meets_capacity(brand, opportunity) else 50
    else:
        scores["capacity"] = 100
    
    # Bonus: preferred attributes (diversity, etc.)
    weights["preferred"] = 5
    if opportunity.preferred_supplier_attributes:
        matches = sum(1 for attr in opportunity.preferred_supplier_attributes
                      if getattr(brand, attr, False))
        scores["preferred"] = (matches / len(opportunity.preferred_supplier_attributes)) * 100
    else:
        scores["preferred"] = 100
    
    # Weighted total
    total = sum(scores[k] * weights[k] for k in scores) / sum(weights.values())
    
    return {
        "total": round(total),
        "breakdown": {k: {"score": round(scores[k]), "weight": weights[k]} for k in scores}
    }
```

---

## 4. Submission Auto-Evaluation

When a brand submits to an opportunity, an Inngest job runs:

1. Load the opportunity requirements.
2. Load the brand profile + submitted products.
3. Run `score_brand_for_opportunity()` (deterministic scoring above).
4. Call Claude for a qualitative summary:

```
System: You are evaluating a CPG brand's submission to a retail buyer's sourcing 
opportunity. Given the structured match scores below, write a 3-sentence summary 
for the buyer explaining this brand's fit. Be factual — cite specific matches and 
gaps. Do not fabricate data.

User:
Opportunity: {opportunity_title}
Brand: {brand_name}
Match Score: {total_score}%
Breakdown: {score_breakdown}
Products Submitted: {product_names}
Cover Note: {cover_note}

Write a 3-sentence evaluation summary.
```

5. Store `ai_match_score`, `ai_score_breakdown`, and summary in the `submissions` table.

---

## 5. AI Content Generation

### 5.1 Brand Story Generator

**Trigger:** Brand clicks "Help me write my brand story" on profile editor.

```
System: You are a CPG brand copywriter. Write a compelling brand story in 150-250 
words for a brand profile on a B2B marketplace. The story should be professional, 
authentic, and highlight what makes this brand unique for retail buyers. Write in 
third person. Do not fabricate facts — only use the information provided.

User:
Brand name: {brand_name}
Category: {category}
Year founded: {year_founded}
Location: {hq_city}, {hq_state}
Founder: {founder_name}
Products: {product_names}
Certifications: {certifications}
Key facts provided by brand: {any_existing_notes}

Write the brand story.
```

### 5.2 Cover Note Drafter

**Trigger:** Brand clicks "Draft cover note" when submitting to an opportunity.

```
System: Write a concise cover note (3-5 sentences) from a CPG brand to a retail 
buyer for a sourcing opportunity submission. Be professional, specific to the 
opportunity requirements, and highlight the brand's relevant strengths. Write in 
first person plural ("we").

User:
Brand: {brand_name}
Opportunity: {opportunity_title}
Opportunity requirements: {requirements_summary}
Brand strengths relevant to this opportunity: {relevant_strengths}
Products being submitted: {product_names}

Draft the cover note.
```

### 5.3 Data Normalization

Background job that runs on brand profile save:
- Standardize certification names (e.g., "USDA organic" → "organic_usda").
- Normalize state names to codes (e.g., "California" → "CA").
- Clean phone numbers to E.164 format.
- Validate URLs (add https:// if missing).
- Flag obvious data issues (e.g., MOQ of 1,000,000 — likely a typo).

---

## 6. Recommendation Engine

### 6.1 "Brands You Should Know" (Buyer Weekly Email)

**Runs:** Every Monday at 9am ET via Inngest cron.

**Logic:**
1. For each verified buyer with email_notifications enabled:
2. Get buyer's categories_buying and geographies_served.
3. Query Algolia for brands published in the last 7 days matching those categories.
4. Score each against buyer profile using the matching algorithm.
5. Take top 5 by match score.
6. Generate email via Resend with brand cards (logo, name, category, match score, CTA to view profile).

### 6.2 "Opportunities For You" (Brand Weekly Email)

**Runs:** Every Monday at 9am ET via Inngest cron.

**Logic:**
1. For each brand on a paid plan with email_notifications enabled:
2. Get opportunities published in the last 7 days.
3. Score each against brand profile.
4. Take top 5 by fit score.
5. Generate email with opportunity cards (title, buyer name if public, deadline, fit score, CTA to view).

### 6.3 Homepage Featured Brands

**Logic:**
- Trending: brands with the most profile views in the last 7 days.
- New: brands published in the last 14 days with ≥ 70% completeness.
- Diverse: rotate through minority/women/veteran-owned brands.
- Curated: admin can pin brands to featured section.

---

## 7. Performance Requirements

| AI Operation | Trigger | Latency Target |
|-------------|---------|----------------|
| Profile completeness scoring | On profile save | < 100ms (deterministic, no AI call) |
| Match scoring (search) | On each search query | < 200ms (deterministic, runs alongside Algolia) |
| Submission auto-evaluation | On submission create | < 30s (async background job, includes Claude call) |
| Content generation | On user request | < 10s (synchronous Claude call) |
| Data normalization | On profile save | < 500ms (rule-based, no AI call) |
| Weekly recommendations | Cron job | < 5 minutes for all users |
