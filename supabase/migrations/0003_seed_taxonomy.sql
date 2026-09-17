-- ============================================================================
-- 0003_seed_taxonomy.sql — Category/subcategory taxonomy
-- (docs/specs/03_DATA_MODEL.md §3.1 seed data, F-16)
-- Idempotent: safe to re-run on any environment.
-- ============================================================================

INSERT INTO categories (name, slug, display_order) VALUES
  ('Food & Beverage', 'food-beverage', 1),
  ('Health & Wellness', 'health-wellness', 2),
  ('Beauty & Personal Care', 'beauty-personal-care', 3),
  ('Household', 'household', 4)
ON CONFLICT (name) DO UPDATE
  SET slug = EXCLUDED.slug,
      display_order = EXCLUDED.display_order;

INSERT INTO subcategories (category_id, name, slug, display_order)
SELECT c.id, s.name, s.slug, s.display_order
FROM (VALUES
  ('food-beverage', 'Beverages', 'beverages', 1),
  ('food-beverage', 'Dairy', 'dairy', 2),
  ('food-beverage', 'Bakery', 'bakery', 3),
  ('food-beverage', 'Snacks', 'snacks', 4),
  ('food-beverage', 'Confectionery', 'confectionery', 5),
  ('food-beverage', 'Frozen', 'frozen', 6),
  ('food-beverage', 'Produce', 'produce', 7),
  ('food-beverage', 'Meat & Seafood', 'meat-seafood', 8),
  ('food-beverage', 'Deli', 'deli', 9),
  ('food-beverage', 'Condiments & Sauces', 'condiments-sauces', 10),
  ('food-beverage', 'Dry Grocery', 'dry-grocery', 11),
  ('food-beverage', 'Baby Food', 'baby-food', 12),
  ('food-beverage', 'Pet Food', 'pet-food', 13),
  ('health-wellness', 'Supplements', 'supplements', 1),
  ('health-wellness', 'Vitamins', 'vitamins', 2),
  ('health-wellness', 'Functional Foods', 'functional-foods', 3),
  ('health-wellness', 'Sports Nutrition', 'sports-nutrition', 4),
  ('beauty-personal-care', 'Skincare', 'skincare', 1),
  ('beauty-personal-care', 'Haircare', 'haircare', 2),
  ('beauty-personal-care', 'Oral Care', 'oral-care', 3),
  ('beauty-personal-care', 'Body Care', 'body-care', 4),
  ('household', 'Cleaning', 'cleaning', 1),
  ('household', 'Paper Products', 'paper-products', 2),
  ('household', 'Home Fragrance', 'home-fragrance', 3)
) AS s(category_slug, name, slug, display_order)
JOIN categories c ON c.slug = s.category_slug
ON CONFLICT (category_id, slug) DO UPDATE
  SET name = EXCLUDED.name,
      display_order = EXCLUDED.display_order;
