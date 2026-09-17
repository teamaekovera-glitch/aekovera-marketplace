# DATA_MODEL.md — Complete Data Schemas

**Version:** 1.0.0  
**Depends on:** `01_REQUIREMENTS.md`

---

## 1. Entity-Relationship Overview

```
users (auth)
  │
  ├── 1:1 ── brand_profiles
  │              │
  │              ├── 1:N ── products
  │              ├── 1:N ── brand_certifications
  │              ├── 1:N ── brand_distribution_regions
  │              ├── 1:N ── brand_media
  │              └── 1:N ── submissions ──► opportunities
  │
  ├── 1:1 ── buyer_profiles
  │              │
  │              ├── 1:N ── opportunities
  │              ├── 1:N ── buyer_saved_brands
  │              ├── 1:N ── buyer_notes
  │              ├── 1:N ── buyer_search_presets
  │              └── 1:N ── sample_requests
  │
  └── N:N ── conversations ── messages
```

---

## 2. Core Tables

### 2.1 `users`
Managed by Supabase Auth. Extended with a `user_profiles` table.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('brand', 'buyer', 'admin')),
  display_name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'active', 'past_due', 'canceled')),
  email_notifications BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 `brand_profiles`

```sql
CREATE TABLE brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'suspended')),
  profile_completeness_score INTEGER DEFAULT 0, -- 0-100
  verified BOOLEAN DEFAULT false,
  slug TEXT UNIQUE, -- URL-friendly, e.g. "acme-foods"
  
  -- Company Info
  legal_name TEXT NOT NULL,
  dba_name TEXT,
  brand_name TEXT NOT NULL,
  brand_story TEXT, -- Rich text, up to 5000 chars
  tagline TEXT, -- Up to 150 chars
  year_founded INTEGER,
  hq_address_line1 TEXT,
  hq_address_line2 TEXT,
  hq_city TEXT,
  hq_state TEXT,
  hq_zip TEXT,
  hq_country TEXT DEFAULT 'US',
  website TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  tiktok_url TEXT,
  phone TEXT,
  contact_email TEXT,
  
  -- Logo & Media (URLs in Supabase Storage)
  logo_url TEXT,
  header_image_url TEXT,
  
  -- Founder / Leadership
  founder_name TEXT,
  founder_title TEXT,
  founder_bio TEXT, -- Up to 1000 chars
  founder_photo_url TEXT,
  
  -- Business Attributes
  employee_count_range TEXT CHECK (employee_count_range IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  annual_revenue_range TEXT CHECK (annual_revenue_range IN ('pre-revenue', '<$1M', '$1M-$5M', '$5M-$25M', '$25M-$100M', '$100M+')),
  business_type TEXT CHECK (business_type IN ('manufacturer', 'brand_owner', 'co-manufacturer', 'distributor', 'broker', 'other')),
  
  -- Ownership & Diversity (self-reported, optional)
  minority_owned BOOLEAN,
  women_owned BOOLEAN,
  veteran_owned BOOLEAN,
  lgbtq_owned BOOLEAN,
  disability_owned BOOLEAN,
  small_business BOOLEAN,
  
  -- Operational
  owns_facility BOOLEAN,
  facility_count INTEGER,
  production_capacity_notes TEXT,
  co_manufacturing_available BOOLEAN DEFAULT false,
  private_label_available BOOLEAN DEFAULT false,
  
  -- Commercial Terms
  moq_minimum INTEGER, -- Units
  moq_notes TEXT,
  lead_time_days_min INTEGER,
  lead_time_days_max INTEGER,
  payment_terms TEXT, -- e.g. "Net 30"
  sample_policy TEXT CHECK (sample_policy IN ('free', 'paid', 'negotiable', 'unavailable')),
  sample_notes TEXT,
  trade_marketing_support TEXT, -- Free text
  
  -- Insurance & Compliance
  has_product_liability_insurance BOOLEAN,
  insurance_coverage_amount TEXT,
  fda_registered BOOLEAN,
  fda_registration_number TEXT,
  
  -- Sustainability
  sustainability_statement TEXT,
  packaging_recyclable BOOLEAN,
  carbon_neutral_certified BOOLEAN,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);
```

### 2.3 `products`

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Core
  name TEXT NOT NULL,
  description TEXT, -- Up to 2000 chars
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES subcategories(id),
  
  -- Identifiers
  upc TEXT,
  ean TEXT,
  sku TEXT,
  
  -- Pricing
  wholesale_price_cents INTEGER, -- In cents to avoid float issues
  msrp_cents INTEGER,
  price_visibility TEXT DEFAULT 'on_request' CHECK (price_visibility IN ('public', 'on_request', 'hidden')),
  
  -- Case Configuration
  units_per_case INTEGER,
  case_length_inches NUMERIC(6,2),
  case_width_inches NUMERIC(6,2),
  case_height_inches NUMERIC(6,2),
  case_weight_lbs NUMERIC(6,2),
  
  -- Product Details
  ingredients_text TEXT,
  nutrition_facts_image_url TEXT,
  allergens TEXT[], -- Array: ['milk', 'soy', 'wheat', 'tree_nuts', 'peanuts', 'eggs', 'fish', 'shellfish', 'sesame']
  shelf_life_days INTEGER,
  storage_requirements TEXT CHECK (storage_requirements IN ('ambient', 'refrigerated', 'frozen')),
  
  -- Packaging
  packaging_format TEXT, -- e.g. "bottle", "pouch", "box", "can", "jar", "tube"
  unit_size TEXT, -- e.g. "12 oz", "500g"
  units_per_pack INTEGER, -- For multi-packs
  packaging_material TEXT,
  
  -- Images (URLs, up to 10)
  images TEXT[], -- Array of Supabase Storage URLs
  hero_image_index INTEGER DEFAULT 0,
  
  -- Certifications (product-level, separate from brand-level)
  certifications TEXT[], -- Array: ['organic', 'non_gmo', 'kosher', 'halal', 'gluten_free', 'vegan', ...]
  
  -- Availability
  available_for_distribution BOOLEAN DEFAULT true,
  available_regions TEXT[], -- US states
  new_product BOOLEAN DEFAULT false, -- Launched within last 12 months
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.4 `buyer_profiles`

```sql
CREATE TABLE buyer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Status
  verified BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verification_notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES user_profiles(id),
  
  -- Company
  company_name TEXT NOT NULL,
  company_type TEXT NOT NULL CHECK (company_type IN ('retailer', 'distributor', 'foodservice', 'ecommerce', 'buying_group', 'other')),
  website TEXT,
  logo_url TEXT,
  description TEXT,
  
  -- Scale
  store_count INTEGER,
  store_format TEXT CHECK (store_format IN ('grocery', 'convenience', 'specialty', 'mass', 'club', 'drug', 'dollar', 'online_only', 'foodservice', 'other')),
  annual_purchasing_volume TEXT,
  
  -- Sourcing Preferences
  categories_buying UUID[], -- References categories table
  geographies_served TEXT[], -- US states
  target_demographics TEXT,
  price_tier TEXT CHECK (price_tier IN ('value', 'mid', 'premium', 'luxury', 'multi')),
  margin_requirement_min NUMERIC(4,1), -- Percentage
  margin_requirement_max NUMERIC(4,1),
  
  -- Required Supplier Attributes
  required_certifications TEXT[],
  preferred_supplier_attributes TEXT[], -- ['minority_owned', 'local', 'organic', etc.]
  
  -- Contact
  primary_contact_name TEXT,
  primary_contact_title TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.5 `opportunities` (Buyer Sourcing Requests)

```sql
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyer_profiles(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'expired')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  
  -- Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Requirements (structured for AI matching)
  required_category_id UUID REFERENCES categories(id),
  required_subcategory_id UUID REFERENCES subcategories(id),
  required_certifications TEXT[],
  required_geography TEXT[], -- Supplier must be in / ship to these states
  required_moq_max INTEGER, -- Brand MOQ must be ≤ this
  required_price_range_min_cents INTEGER,
  required_price_range_max_cents INTEGER,
  required_margin_min NUMERIC(4,1),
  required_packaging_formats TEXT[],
  required_production_capacity_min INTEGER, -- Units/month
  required_storage TEXT CHECK (required_storage IN ('ambient', 'refrigerated', 'frozen', 'any')),
  required_shelf_life_min_days INTEGER,
  preferred_supplier_attributes TEXT[], -- Diversity, local, etc.
  
  -- Timing
  submission_deadline TIMESTAMPTZ,
  target_start_date DATE,
  
  -- Stats (denormalized for display)
  submission_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);
```

### 2.6 `submissions`

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  
  -- Content
  cover_note TEXT,
  selected_product_ids UUID[], -- Products submitted for this opportunity
  additional_documents TEXT[], -- Supabase Storage URLs
  
  -- AI Scoring
  ai_match_score INTEGER, -- 0-100
  ai_score_breakdown JSONB, -- {"category_fit": 95, "geography_fit": 80, "certification_fit": 70, ...}
  ai_scored_at TIMESTAMPTZ,
  
  -- Buyer Review
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'declined', 'accepted')),
  buyer_notes TEXT, -- Internal buyer notes
  decline_reason TEXT,
  
  -- Uniqueness
  UNIQUE(opportunity_id, brand_id), -- One submission per brand per opportunity
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.7 `conversations` and `messages`

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brand_profiles(id),
  buyer_id UUID NOT NULL REFERENCES buyer_profiles(id),
  subject TEXT,
  last_message_at TIMESTAMPTZ,
  brand_unread_count INTEGER DEFAULT 0,
  buyer_unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_id, buyer_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES user_profiles(id),
  body TEXT NOT NULL,
  attachments TEXT[], -- Supabase Storage URLs
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 3. Reference Tables

### 3.1 Categories & Subcategories

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER
);

CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  display_order INTEGER,
  UNIQUE(category_id, slug)
);
```

**Seed data — categories:**
Food & Beverage: Beverages, Dairy, Bakery, Snacks, Confectionery, Frozen, Produce, Meat & Seafood, Deli, Condiments & Sauces, Dry Grocery, Baby Food, Pet Food.
Health & Wellness: Supplements, Vitamins, Functional Foods, Sports Nutrition.
Beauty & Personal Care: Skincare, Haircare, Oral Care, Body Care.
Household: Cleaning, Paper Products, Home Fragrance.

### 3.2 Certifications

```sql
CREATE TABLE certifications_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- 'organic_usda', 'non_gmo_project', etc.
  display_name TEXT NOT NULL,
  category TEXT, -- 'food_safety', 'organic', 'dietary', 'social', 'sustainability'
  description TEXT,
  logo_url TEXT
);

CREATE TABLE brand_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  certification_code TEXT NOT NULL REFERENCES certifications_reference(code),
  certificate_url TEXT, -- Upload of the actual certificate
  expiration_date DATE,
  verified BOOLEAN DEFAULT false,
  UNIQUE(brand_id, certification_code)
);
```

### 3.3 Distribution Regions

```sql
CREATE TABLE brand_distribution_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  state_code TEXT NOT NULL, -- 'CA', 'NY', etc.
  distribution_type TEXT CHECK (distribution_type IN ('available', 'active', 'planned')),
  UNIQUE(brand_id, state_code)
);
```

### 3.4 Buyer Activity Tables

```sql
CREATE TABLE buyer_saved_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyer_profiles(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  folder_name TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(buyer_id, brand_id)
);

CREATE TABLE buyer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyer_profiles(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sample_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyer_profiles(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  product_ids UUID[],
  ship_to_address TEXT,
  quantity_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'shipped', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE buyer_search_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyer_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL, -- Serialized Algolia filter state
  notify_new_matches BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. Analytics & Tracking

```sql
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  viewer_user_id UUID REFERENCES user_profiles(id), -- NULL for anonymous
  viewer_role TEXT,
  source TEXT, -- 'search', 'opportunity', 'recommendation', 'direct'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE search_appearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  search_query TEXT,
  search_filters JSONB,
  position INTEGER, -- Rank in search results
  clicked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. Indexes

```sql
-- Performance indexes
CREATE INDEX idx_brand_profiles_status ON brand_profiles(status);
CREATE INDEX idx_brand_profiles_slug ON brand_profiles(slug);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_deadline ON opportunities(submission_deadline);
CREATE INDEX idx_submissions_opportunity ON submissions(opportunity_id);
CREATE INDEX idx_submissions_brand ON submissions(brand_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_profile_views_brand ON profile_views(brand_id);
CREATE INDEX idx_profile_views_created ON profile_views(created_at);
```
