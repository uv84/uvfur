CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_no_self_parent CHECK (parent_id IS NULL OR parent_id <> id)
);

CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON categories(parent_id);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  price numeric(10, 2),
  amazon_price numeric(10, 2) CHECK (amazon_price IS NULL OR amazon_price >= 0),
  bosch_price numeric(10, 2) CHECK (bosch_price IS NULL OR bosch_price >= 0),
  image_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);

CREATE TABLE IF NOT EXISTS price_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS price_requests_created_at_idx ON price_requests(created_at DESC);

-- Rename the original demo rows in place so existing products retain their category IDs.
UPDATE categories SET name = 'Washers & dryers', slug = 'washers-dryers',
  description = 'Browse laundry appliances and accessories for everyday care.',
  image_url = 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=85',
  sort_order = 1
WHERE slug IN ('doors-and-drawer-fronts', 'laundry');

UPDATE categories SET name = 'Cooking & baking', slug = 'cooking-baking',
  description = 'Explore appliances and tools for preparing meals at home.',
  image_url = 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1000&q=85',
  sort_order = 2
WHERE slug IN ('cabinet-components', 'cooking');

UPDATE categories SET name = 'Washing machines', slug = 'washing-machines',
  description = 'Laundry appliances for a range of household needs.',
  image_url = 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=85'
WHERE slug IN ('shaker-doors', 'washing-machines');

UPDATE categories SET name = 'Built-in ovens', slug = 'built-in-ovens',
  description = 'Explore built-in cooking options for your kitchen.',
  image_url = 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85'
WHERE slug IN ('drawer-boxes', 'ovens');

INSERT INTO categories (name, slug, description, image_url, sort_order)
VALUES
  ('Washers & dryers', 'washers-dryers', 'Browse laundry appliances and accessories for everyday care.',
    'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=85', 1),
  ('Cooking & baking', 'cooking-baking', 'Explore appliances and tools for preparing meals at home.',
    'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1000&q=85', 2),
  ('Mixer grinders', 'mixer-grinders', 'Small appliances for mixing and grinding ingredients.',
    'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1000&q=85', 3),
  ('Air fryers', 'air-fryers', 'Countertop appliances for convenient everyday cooking.',
    'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1000&q=85', 4),
  ('Dishwashers', 'dishwashers', 'Explore freestanding and integrated dishwashing options.',
    'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1000&q=85', 5),
  ('Refrigerators', 'refrigerators', 'Compare refrigerator styles for different kitchens and households.',
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1000&q=85', 6),
  ('Food processors', 'food-processors', 'Food preparation appliances for a variety of kitchen tasks.',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1000&q=85', 7),
  ('Food preparation', 'food-preparation', 'Browse countertop tools for preparing everyday meals.',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=85', 8),
  ('Coffee machines', 'coffee-machines', 'Explore coffee equipment for home use.',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85', 9),
  ('Vacuum cleaners', 'vacuum-cleaners', 'Cleaning appliances for different floor and home needs.',
    'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1000&q=85', 10),
  ('Cleaning & care', 'cleaning-care', 'Browse care products for maintaining household appliances.',
    'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=1000&q=85', 11)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order;

INSERT INTO categories (parent_id, name, slug, description, image_url, sort_order)
SELECT parent.id, seed.name, seed.slug, seed.description, seed.image_url, seed.sort_order
FROM (
  VALUES
    ('cooking-baking', 'Built-in ovens', 'built-in-ovens', 'Built-in options for everyday baking and cooking.', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85', 1),
    ('cooking-baking', 'Induction hobs', 'induction-hobs', 'Induction cooking surfaces for modern kitchens.', 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1000&q=85', 2),
    ('cooking-baking', 'Cooking and baking accessories', 'cooking-baking-accessories', 'Accessories for cooking and baking appliances.', 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1000&q=85', 3),
    ('cooking-baking', 'Gas hobs', 'gas-hobs', 'Gas cooking surfaces in a range of layouts.', 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1000&q=85', 4),
    ('cooking-baking', 'Steam appliances', 'steam-appliances', 'Steam-based appliances for home cooking.', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85', 5),
    ('cooking-baking', 'Microwaves', 'microwaves', 'Microwave appliances for convenient meal preparation.', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85', 6),
    ('cooking-baking', 'Chimneys', 'chimneys', 'Kitchen ventilation options for cooking spaces.', 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1000&q=85', 7),
    ('washers-dryers', 'Washing machines', 'washing-machines', 'Laundry appliances for washing household fabrics.', 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=85', 1),
    ('washers-dryers', 'Accessories', 'laundry-accessories', 'Accessories for laundry appliances.', 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=85', 2),
    ('washers-dryers', 'Dryers', 'dryers', 'Appliances for drying laundry at home.', 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=85', 3),
    ('washers-dryers', 'Washer dryers', 'washer-dryers', 'Combined appliances for washing and drying laundry.', 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=85', 4),
    ('washers-dryers', 'Cleaning and care', 'laundry-care', 'Care products for laundry appliances.', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=1000&q=85', 5),
    ('dishwashers', 'Freestanding dishwashers', 'freestanding-dishwashers', 'Standalone appliances for cleaning dishes.', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1000&q=85', 1),
    ('dishwashers', 'Accessories', 'dishwasher-accessories', 'Accessories for dishwashing appliances.', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1000&q=85', 2),
    ('dishwashers', 'Built-in dishwashers', 'built-in-dishwashers', 'Integrated dishwashing appliances for fitted kitchens.', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1000&q=85', 3),
    ('dishwashers', 'Cleaning and care', 'dishwasher-care', 'Care products for dishwashing appliances.', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=1000&q=85', 4),
    ('refrigerators', 'Accessories', 'refrigerator-accessories', 'Accessories for refrigerator storage and care.', 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1000&q=85', 1),
    ('refrigerators', 'Cleaning and care', 'refrigerator-care', 'Care products for refrigeration appliances.', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=1000&q=85', 2),
    ('refrigerators', 'Side-by-side refrigerators', 'side-by-side-refrigerators', 'Side-by-side refrigerator formats.', 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1000&q=85', 3),
    ('refrigerators', 'French door refrigerators', 'french-door-refrigerators', 'French door refrigerator formats.', 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1000&q=85', 4),
    ('refrigerators', 'Single door refrigerators', 'single-door-refrigerators', 'Compact single-door refrigerator formats.', 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1000&q=85', 5),
    ('food-preparation', 'Air fryers', 'food-preparation-air-fryers', 'Countertop appliances for air-based cooking.', 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1000&q=85', 1),
    ('food-preparation', 'Accessories', 'food-preparation-accessories', 'Accessories for food preparation appliances.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=85', 2),
    ('food-preparation', 'Hand blenders', 'hand-blenders', 'Handheld appliances for blending and mixing ingredients.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=85', 3),
    ('food-preparation', 'Hand mixers', 'hand-mixers', 'Handheld appliances for mixing ingredients.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=85', 4),
    ('food-preparation', 'Juice extractors', 'juice-extractors', 'Appliances for preparing fresh juice.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=85', 5),
    ('food-preparation', 'Kettles', 'kettles', 'Electric kettles for everyday kitchen use.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=85', 6),
    ('vacuum-cleaners', 'Cordless vacuum cleaners', 'cordless-vacuum-cleaners', 'Cordless cleaning appliances for around the home.', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1000&q=85', 1),
    ('cleaning-care', 'Laundry care', 'care-laundry', 'Care products for laundry appliances.', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=1000&q=85', 1),
    ('cleaning-care', 'Dishwasher care', 'care-dishwasher', 'Care products for dishwashing appliances.', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=1000&q=85', 2),
    ('cleaning-care', 'Coffee machine care', 'care-coffee-machines', 'Care products for coffee appliances.', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=1000&q=85', 3),
    ('cleaning-care', 'Descaling products', 'descaling-products', 'Descaling products for compatible household appliances.', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=1000&q=85', 4)
) AS seed(parent_slug, name, slug, description, image_url, sort_order)
JOIN categories AS parent ON parent.slug = seed.parent_slug
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order;

UPDATE products SET
  name = 'Front-load washing machine',
  slug = 'sample-front-load-washing-machine',
  description = 'Sample listing. Replace with verified model information and pricing before publishing.',
  price = NULL,
  amazon_price = NULL,
  bosch_price = NULL,
  image_url = 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=85'
WHERE slug IN ('classic-shaker-cabinet-door', 'bosch-series-6-front-load-washing-machine');

UPDATE products SET
  name = 'Built-in oven',
  slug = 'sample-built-in-oven',
  description = 'Sample listing. Replace with verified model information and pricing before publishing.',
  price = NULL,
  amazon_price = NULL,
  bosch_price = NULL,
  image_url = 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85'
WHERE slug IN ('dovetail-maple-drawer-box', 'bosch-series-8-built-in-oven');

UPDATE products SET
  name = 'Dishwasher',
  slug = 'sample-dishwasher',
  description = 'Example home appliance. Add your approved model details and price in the catalog admin.',
  price = NULL,
  amazon_price = NULL,
  bosch_price = NULL,
  image_url = 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1000&q=85'
WHERE slug = 'bosch-series-6-built-in-dishwasher';

UPDATE products SET
  name = 'Refrigerator',
  slug = 'sample-refrigerator',
  description = 'Example home appliance. Add your approved model details and price in the catalog admin.',
  price = NULL,
  amazon_price = NULL,
  bosch_price = NULL,
  image_url = 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1000&q=85'
WHERE slug = 'bosch-series-6-french-door-refrigerator';

INSERT INTO products (
  category_id, name, slug, description, price, amazon_price, bosch_price, image_url
)
SELECT category.id, seed.name, seed.slug, seed.description, NULL, NULL, NULL, seed.image_url
FROM (
  VALUES
    ('washing-machines', 'Front-load washing machine', 'sample-front-load-washing-machine', 'Sample listing. Replace with verified model information and pricing before publishing.', 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=85'),
    ('built-in-ovens', 'Built-in oven', 'sample-built-in-oven', 'Sample listing. Replace with verified model information and pricing before publishing.', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85'),
    ('mixer-grinders', 'Mixer grinder', 'sample-mixer-grinder', 'Example kitchen appliance. Add your approved model details and price in the catalog admin.', 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1000&q=85'),
    ('air-fryers', 'Air fryer', 'sample-air-fryer', 'Example kitchen appliance. Add your approved model details and price in the catalog admin.', 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1000&q=85'),
    ('built-in-dishwashers', 'Dishwasher', 'sample-dishwasher', 'Example home appliance. Add your approved model details and price in the catalog admin.', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1000&q=85'),
    ('french-door-refrigerators', 'Refrigerator', 'sample-refrigerator', 'Example home appliance. Add your approved model details and price in the catalog admin.', 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1000&q=85'),
    ('food-processors', 'Food processor', 'sample-food-processor', 'Example kitchen appliance. Add your approved model details and price in the catalog admin.', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1000&q=85'),
    ('hand-blenders', 'Hand blender', 'sample-hand-blender', 'Example kitchen appliance. Add your approved model details and price in the catalog admin.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=85'),
    ('coffee-machines', 'Coffee machine', 'sample-coffee-machine', 'Example kitchen appliance. Add your approved model details and price in the catalog admin.', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85'),
    ('cordless-vacuum-cleaners', 'Cordless vacuum cleaner', 'sample-cordless-vacuum-cleaner', 'Example home appliance. Add your approved model details and price in the catalog admin.', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1000&q=85'),
    ('cleaning-care', 'Appliance care product', 'sample-appliance-care-product', 'Example care product. Add verified contents, usage details, and price before publishing.', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=1000&q=85')
) AS seed(category_slug, name, slug, description, image_url)
JOIN categories AS category ON category.slug = seed.category_slug
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = NULL,
  amazon_price = NULL,
  bosch_price = NULL,
  image_url = EXCLUDED.image_url,
  is_active = true;
