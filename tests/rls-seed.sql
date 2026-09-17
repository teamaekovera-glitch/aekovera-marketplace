-- Test fixture data (run by tests/rls.test.ts before the policy assertions).
-- Deterministic ids so cross-tenant assertions read clearly.
-- user_profiles.id has FK to auth.users (Supabase shim locally), so fixture
-- users are registered there first.
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('11111111-1111-4111-8111-111111111111', 'brandA@test.aekovera.com', '{"role":"brand"}'),
  ('22222222-2222-4222-8222-222222222222', 'brandB@test.aekovera.com', '{"role":"brand"}'),
  ('33333333-3333-4333-8333-333333333333', 'buyerA@test.aekovera.com', '{"role":"buyer"}'),
  ('44444444-4444-4444-8444-444444444444', 'buyerB@test.aekovera.com', '{"role":"buyer"}'),
  ('55555555-5555-4555-8555-555555555555', 'admin@test.aekovera.com', '{"role":"admin"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (id, email, role, display_name) VALUES
  ('11111111-1111-4111-8111-111111111111', 'brandA@test.aekovera.com', 'brand', 'Brand A'),
  ('22222222-2222-4222-8222-222222222222', 'brandB@test.aekovera.com', 'brand', 'Brand B'),
  ('33333333-3333-4333-8333-333333333333', 'buyerA@test.aekovera.com', 'buyer', 'Buyer A'),
  ('44444444-4444-4444-8444-444444444444', 'buyerB@test.aekovera.com', 'buyer', 'Buyer B'),
  ('55555555-5555-4555-8555-555555555555', 'admin@test.aekovera.com', 'admin', 'Admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO brand_profiles (user_id, brand_name, legal_name, slug, status) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Brand A', 'Brand A LLC', 'brand-a', 'published'),
  ('22222222-2222-4222-8222-222222222222', 'Brand B', 'Brand B LLC', 'brand-b', 'published');

INSERT INTO buyer_profiles (user_id, company_name, company_type, verification_status) VALUES
  ('33333333-3333-4333-8333-333333333333', 'Buyer A Co', 'retailer', 'approved'),
  ('44444444-4444-4444-8444-444444444444', 'Buyer B Co', 'retailer', 'approved');

INSERT INTO products (brand_id, name, status) VALUES
  ((SELECT id FROM brand_profiles WHERE slug = 'brand-a'), 'Product A1', 'published'),
  ((SELECT id FROM brand_profiles WHERE slug = 'brand-b'), 'Product B1', 'draft');

INSERT INTO opportunities (buyer_id, title, description, status, visibility) VALUES
  ((SELECT id FROM buyer_profiles WHERE company_name = 'Buyer A Co'), 'Opportunity A1', 'Test opportunity from Buyer A', 'published', 'public'),
  ((SELECT id FROM buyer_profiles WHERE company_name = 'Buyer B Co'), 'Opportunity B1', 'Draft private opportunity', 'draft', 'private');

INSERT INTO conversations (brand_id, buyer_id) VALUES
  ((SELECT id FROM brand_profiles WHERE slug = 'brand-a'),
   (SELECT id FROM buyer_profiles WHERE company_name = 'Buyer A Co'));
