-- ============================================================================
-- 0002_rls.sql — Row-Level Security (docs/specs/07_SECURITY_PAYMENTS_SPEC.md §3)
--
-- Policies for brand_profiles, products, buyer_profiles, opportunities,
-- submissions, and messages are verbatim from the spec. Policies for the
-- remaining tables are derived from the spec's §2.2 permission matrix and the
-- architecture rule (02_ARCHITECTURE.md §3.2: "Every database table has RLS
-- policies"). Derivations are marked with DERIVED comments.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS on every public table
-- ---------------------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_distribution_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_saved_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_search_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Grants (Supabase-standard: RLS is the security boundary, not the grants)
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- ===========================================================================
-- 3.1 brand_profiles (verbatim)
-- ===========================================================================

-- Brands can read their own profile
CREATE POLICY brand_own_read ON brand_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Anyone can read published brand profiles
CREATE POLICY brand_public_read ON brand_profiles FOR SELECT
  USING (status = 'published');

-- Brands can update their own profile
CREATE POLICY brand_own_update ON brand_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Brands can insert their own profile
CREATE POLICY brand_own_insert ON brand_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admin can do everything (via service role key, bypasses RLS)

-- ===========================================================================
-- 3.2 products (verbatim)
-- ===========================================================================

-- Brand can CRUD their own products
CREATE POLICY product_own_all ON products FOR ALL
  USING (brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()));

-- Anyone can read products of published brands
CREATE POLICY product_public_read ON products FOR SELECT
  USING (
    status = 'published' AND
    brand_id IN (SELECT id FROM brand_profiles WHERE status = 'published')
  );

-- ===========================================================================
-- 3.3 buyer_profiles (verbatim)
-- ===========================================================================

-- Buyers can read/update their own profile
CREATE POLICY buyer_own ON buyer_profiles FOR ALL
  USING (user_id = auth.uid());

-- Brands cannot read buyer profiles (buyers are anonymous to brands unless they message)
-- No public read policy for buyer_profiles

-- ===========================================================================
-- 3.4 opportunities (verbatim)
-- ===========================================================================

-- Buyer can CRUD their own opportunities
CREATE POLICY opp_own ON opportunities FOR ALL
  USING (buyer_id IN (SELECT id FROM buyer_profiles WHERE user_id = auth.uid()));

-- Published public opportunities are readable by all authenticated users
CREATE POLICY opp_public_read ON opportunities FOR SELECT
  USING (status = 'published' AND visibility = 'public');

-- ===========================================================================
-- 3.5 submissions (verbatim)
-- ===========================================================================

-- Brand can read their own submissions
CREATE POLICY sub_brand_read ON submissions FOR SELECT
  USING (brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()));

-- Brand can create submissions (plan check happens in application layer)
CREATE POLICY sub_brand_create ON submissions FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()));

-- Buyer can read submissions to their own opportunities
CREATE POLICY sub_buyer_read ON submissions FOR SELECT
  USING (opportunity_id IN (
    SELECT id FROM opportunities WHERE buyer_id IN (
      SELECT id FROM buyer_profiles WHERE user_id = auth.uid()
    )
  ));

-- Buyer can update submission status (shortlist, decline)
CREATE POLICY sub_buyer_update ON submissions FOR UPDATE
  USING (opportunity_id IN (
    SELECT id FROM opportunities WHERE buyer_id IN (
      SELECT id FROM buyer_profiles WHERE user_id = auth.uid()
    )
  ));

-- ===========================================================================
-- 3.6 messages (verbatim)
-- ===========================================================================

-- Users can read messages in their own conversations
CREATE POLICY msg_read ON messages FOR SELECT
  USING (conversation_id IN (
    SELECT id FROM conversations WHERE
      brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()) OR
      buyer_id IN (SELECT id FROM buyer_profiles WHERE user_id = auth.uid())
  ));

-- Users can insert messages in their own conversations
CREATE POLICY msg_insert ON messages FOR INSERT
  WITH CHECK (sender_user_id = auth.uid());

-- ===========================================================================
-- DERIVED — conversations (§2.2: "Messages (read/write): Own conversations")
-- ===========================================================================

CREATE POLICY conv_read ON conversations FOR SELECT
  USING (
    brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()) OR
    buyer_id IN (SELECT id FROM buyer_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY conv_insert ON conversations FOR INSERT
  WITH CHECK (
    brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()) OR
    buyer_id IN (SELECT id FROM buyer_profiles WHERE user_id = auth.uid())
  );

-- Unread-count maintenance by the conversation participants
CREATE POLICY conv_update ON conversations FOR UPDATE
  USING (
    brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()) OR
    buyer_id IN (SELECT id FROM buyer_profiles WHERE user_id = auth.uid())
  );

-- ===========================================================================
-- DERIVED — user_profiles (users read/update their own profile; needed for
-- role detection and self-service settings; no public read)
-- ===========================================================================

CREATE POLICY user_profile_own_all ON user_profiles FOR ALL
  USING (id = auth.uid());

-- ===========================================================================
-- DERIVED — brand detail tables (own-brand write; public read only for
-- published brands, mirroring brand_public_read)
-- ===========================================================================

CREATE POLICY brand_cert_own_all ON brand_certifications FOR ALL
  USING (brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()));

CREATE POLICY brand_cert_public_read ON brand_certifications FOR SELECT
  USING (brand_id IN (SELECT id FROM brand_profiles WHERE status = 'published'));

CREATE POLICY brand_region_own_all ON brand_distribution_regions FOR ALL
  USING (brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()));

CREATE POLICY brand_region_public_read ON brand_distribution_regions FOR SELECT
  USING (brand_id IN (SELECT id FROM brand_profiles WHERE status = 'published'));

CREATE POLICY brand_media_own_all ON brand_media FOR ALL
  USING (brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()));

CREATE POLICY brand_media_public_read ON brand_media FOR SELECT
  USING (brand_id IN (SELECT id FROM brand_profiles WHERE status = 'published'));

-- ===========================================================================
-- DERIVED — buyer activity tables (§2.2: buyer sees own rows only)
-- ===========================================================================

CREATE POLICY saved_brands_own_all ON buyer_saved_brands FOR ALL
  USING (buyer_id IN (SELECT id FROM buyer_profiles WHERE user_id = auth.uid()));

CREATE POLICY buyer_notes_own_all ON buyer_notes FOR ALL
  USING (buyer_id IN (SELECT id FROM buyer_profiles WHERE user_id = auth.uid()));

CREATE POLICY sample_requests_own_all ON sample_requests FOR ALL
  USING (buyer_id IN (SELECT id FROM buyer_profiles WHERE user_id = auth.uid()));

CREATE POLICY search_presets_own_all ON buyer_search_presets FOR ALL
  USING (buyer_id IN (SELECT id FROM buyer_profiles WHERE user_id = auth.uid()));

-- ===========================================================================
-- DERIVED — analytics tables (§2.2 "Analytics: Brand (own)"): a brand reads
-- only its own metrics. Rows are written server-side via the service role,
-- so no client insert policy exists.
-- ===========================================================================

CREATE POLICY profile_views_brand_read ON profile_views FOR SELECT
  USING (brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()));

CREATE POLICY search_appearances_brand_read ON search_appearances FOR SELECT
  USING (brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()));

-- ===========================================================================
-- DERIVED — reference taxonomy (public reference data used by onboarding
-- and search facets)
-- ===========================================================================

CREATE POLICY categories_public_read ON categories FOR SELECT
  USING (true);

CREATE POLICY subcategories_public_read ON subcategories FOR SELECT
  USING (true);

CREATE POLICY certifications_public_read ON certifications_reference FOR SELECT
  USING (true);

-- ===========================================================================
-- DERIVED — compliance & operations tables: no client policies. Clients
-- (anon/authenticated) are denied entirely; the service role bypasses RLS
-- and is the only writer/reader (webhook processing, audit trail, platform
-- admin per §2.2 "Admin panel: Admin ✓").
-- audit_log, processed_webhook_events — intentionally policy-free.
-- ===========================================================================
