-- ============================================================================
-- 0004_seed_certifications.sql — Certifications reference table
-- (docs/specs/03_DATA_MODEL.md §3.2 + F-17: "All standard CPG certifications")
-- Codes referenced across the spec suite: organic_usda, non_gmo_project,
-- kosher, halal, sqf, brc, fair_trade, b_corp, gluten_free, vegan.
-- Idempotent: safe to re-run on any environment.
-- ============================================================================

INSERT INTO certifications_reference (code, display_name, category, description) VALUES
  -- Food safety (GFSI and audit schemes)
  ('sqf', 'SQF Certified', 'food_safety', 'Safe Quality Food (SQF) certification — GFSI-recognized food safety and quality program.'),
  ('brcgs', 'BRCGS Certified', 'food_safety', 'BRCGS Global Standard for Food Safety — GFSI-recognized food safety certification.'),
  ('fssc_22000', 'FSSC 22000', 'food_safety', 'FSSC 22000 — GFSI-recognized food safety management system certification.'),
  ('haccp', 'HACCP Certified', 'food_safety', 'Hazard Analysis and Critical Control Points food safety plan certification.'),

  -- Organic
  ('organic_usda', 'USDA Organic', 'organic', 'Certified organic under the USDA National Organic Program.'),

  -- Dietary & lifestyle
  ('non_gmo_project', 'Non-GMO Project Verified', 'dietary', 'Verified non-GMO under the Non-GMO Project standard.'),
  ('gluten_free', 'Certified Gluten-Free', 'dietary', 'Certified gluten-free (GFCO standard, <10ppm).'),
  ('kosher', 'Kosher Certified', 'dietary', 'Kosher certified (e.g. OU, Star-K, Kof-K).'),
  ('halal', 'Halal Certified', 'dietary', 'Halal certified for Muslim consumers.'),
  ('vegan', 'Certified Vegan', 'dietary', 'Certified free of animal ingredients and by-products, no animal testing.'),

  -- Social & ethical
  ('fair_trade', 'Fair Trade Certified', 'social', 'Fair Trade Certified — ethical sourcing with community development premiums.'),
  ('b_corp', 'Certified B Corporation', 'social', 'Certified B Corp — verified social and environmental performance.'),
  ('wbenc', 'WBENC Certified', 'social', 'Women''s Business Enterprise National Council certification (women-owned).'),

  -- Sustainability
  ('rainforest_alliance', 'Rainforest Alliance Certified', 'sustainability', 'Rainforest Alliance certification for sustainable agriculture and forestry.'),
  ('regenerative_organic', 'Regenerative Organic Certified', 'sustainability', 'Regenerative Organic Certified — soil health, animal welfare, and social fairness.'),
  ('certified_humane', 'Certified Humane', 'sustainability', 'Certified Humane Raised and Handled — animal welfare standard.'),
  ('msc', 'MSC Certified', 'sustainability', 'Marine Stewardship Council certification for sustainable wild-caught seafood.'),
  ('upcycled_certified', 'Upcycled Certified', 'sustainability', 'Upcycled Certified — products made from surplus or by-product ingredients.')
ON CONFLICT (code) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      category = EXCLUDED.category,
      description = EXCLUDED.description;
