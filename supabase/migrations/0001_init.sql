-- ============================================================================
-- 0001_init.sql — Full marketplace schema (docs/specs/03_DATA_MODEL.md)
--                 + audit_log (docs/specs/07_SECURITY_PAYMENTS_SPEC.md §6.2)
--
-- PostgreSQL 16 compatible. Supabase compatible: on Supabase, the auth schema,
-- auth.users, auth.uid()/auth.role(), and the anon/authenticated/service_role
-- roles already exist, so every shim below is a no-op there.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Supabase compat: auth schema stub (local PostgreSQL / CI only)
-- ---------------------------------------------------------------------------
DO $do$
BEGIN
  IF to_regclass('auth.users') IS NULL THEN
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE auth.users (
      id UUID PRIMARY KEY,
      email TEXT,
      raw_user_meta_data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  END IF;
END
$do$;

-- ---------------------------------------------------------------------------
-- Supabase compat: JWT helper functions (created only when missing, so the
-- Supabase-native implementations win when they exist)
-- ---------------------------------------------------------------------------
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'auth' AND p.proname = 'uid'
  ) THEN
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE
    AS $fn$
      SELECT NULLIF(current_setting('request.jwt.claims', true)::json ->> 'sub', '')::uuid
    $fn$;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'auth' AND p.proname = 'role'
  ) THEN
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE
    AS $fn$
      SELECT COALESCE(
        NULLIF(current_setting('request.jwt.claims', true)::json ->> 'role', ''),
        'anon'
      )
    $fn$;
  END IF;
END
$do$;

-- ---------------------------------------------------------------------------
-- Supabase compat: client roles (anon, authenticated, service_role).
-- On Supabase these are managed by the platform; here they only need to exist
-- so RLS policies and GRANTs resolve. NOLOGIN: test sessions use SET ROLE.
-- ---------------------------------------------------------------------------
DO $do$
DECLARE
  role_name TEXT;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('CREATE ROLE %I NOLOGIN NOINHERIT', role_name);
    END IF;
  END LOOP;
END
$do$;

-- Supabase's service_role bypasses RLS; mirror that so local/CI behavior matches.
DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'service_role' AND rolbypassrls = false
  ) THEN
    ALTER ROLE service_role BYPASSRLS;
  END IF;
END
$do$;

-- Supabase grants client roles usage of the auth schema and its JWT helpers;
-- mirror that so auth.uid()/auth.role() calls resolve for every client role.
DO $do$
BEGIN
  IF to_regclass('auth.users') IS NOT NULL THEN
    GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION auth.uid(), auth.role() TO anon, authenticated, service_role;
  END IF;
END
$do$;

-- ============================================================================
-- Reference tables (03_DATA_MODEL.md §3.1)
-- ============================================================================

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

CREATE TABLE certifications_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- 'organic_usda', 'non_gmo_project', etc.
  display_name TEXT NOT NULL,
  category TEXT, -- 'food_safety', 'organic', 'dietary', 'social', 'sustainability'
  description TEXT,
  logo_url TEXT
);

-- ============================================================================
-- Core tables (03_DATA_MODEL.md §2)
-- ============================================================================

-- 2.1 user_profiles — extends Supabase auth.users
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

-- 2.2 brand_profiles
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

-- 2.3 products
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

-- 2.4 buyer_profiles
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

-- 2.5 opportunities (Buyer Sourcing Requests)
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

-- 2.6 submissions
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

-- 2.7 conversations and messages
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

-- ============================================================================
-- Brand detail tables (03_DATA_MODEL.md §3.2, §3.3)
-- ============================================================================

CREATE TABLE brand_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  certification_code TEXT NOT NULL REFERENCES certifications_reference(code),
  certificate_url TEXT, -- Upload of the actual certificate
  expiration_date DATE,
  verified BOOLEAN DEFAULT false,
  UNIQUE(brand_id, certification_code)
);

CREATE TABLE brand_distribution_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  state_code TEXT NOT NULL, -- 'CA', 'NY', etc.
  distribution_type TEXT CHECK (distribution_type IN ('available', 'active', 'planned')),
  UNIQUE(brand_id, state_code)
);

-- Referenced by the §1 ER overview (1:N brand_media); stores company
-- photos/videos as Storage URLs (products carry their own images array).
CREATE TABLE brand_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- Buyer activity tables (03_DATA_MODEL.md §3.4)
-- ============================================================================

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

-- ============================================================================
-- Analytics & tracking (03_DATA_MODEL.md §4)
-- ============================================================================

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

-- ============================================================================
-- Compliance & operations
-- ============================================================================

-- audit_log (07_SECURITY_PAYMENTS_SPEC.md §6.2 — SOC 2 audit trail)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL, -- 'profile_update', 'submission_create', 'login', 'plan_change', etc.
  resource_type TEXT, -- 'brand_profile', 'product', 'opportunity', etc.
  resource_id UUID,
  metadata JSONB, -- Action-specific data
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stripe webhook idempotency ledger (07_SECURITY_PAYMENTS_SPEC.md §7.5:
-- "All 5 Stripe webhook events handled idempotently"). One row per processed
-- Stripe event id; write-only via service role.
CREATE TABLE processed_webhook_events (
  id TEXT PRIMARY KEY, -- Stripe event id, e.g. 'evt_...'
  provider TEXT NOT NULL DEFAULT 'stripe',
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- updated_at maintenance
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql
AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END
$fn$;

CREATE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_brand_profiles_updated_at BEFORE UPDATE ON brand_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_buyer_profiles_updated_at BEFORE UPDATE ON buyer_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_opportunities_updated_at BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_submissions_updated_at BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_buyer_notes_updated_at BEFORE UPDATE ON buyer_notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- Indexes (03_DATA_MODEL.md §5, verbatim)
-- ============================================================================
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
