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

INSERT INTO categories (name, slug, description, image_url, sort_order)
VALUES
  (
    'Doors & Drawer Fronts',
    'doors-and-drawer-fronts',
    'Custom cabinet doors and drawer fronts made to fit your vision.',
    'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1000&q=85',
    1
  ),
  (
    'Cabinet Components',
    'cabinet-components',
    'The considered building blocks behind beautifully made cabinetry.',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85',
    2
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order;

INSERT INTO categories (parent_id, name, slug, description, image_url, sort_order)
SELECT parent.id, seed.name, seed.slug, seed.description, seed.image_url, seed.sort_order
FROM (
  VALUES
    (
      'doors-and-drawer-fronts',
      'Shaker Doors',
      'shaker-doors',
      'A clean, versatile profile for timeless kitchens and baths.',
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1000&q=85',
      1
    ),
    (
      'cabinet-components',
      'Drawer Boxes',
      'drawer-boxes',
      'Thoughtfully built drawer boxes for everyday function.',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=85',
      1
    )
) AS seed(parent_slug, name, slug, description, image_url, sort_order)
JOIN categories AS parent ON parent.slug = seed.parent_slug
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order;

INSERT INTO products (category_id, name, slug, description, price, image_url)
SELECT category.id, seed.name, seed.slug, seed.description, seed.price, seed.image_url
FROM (
  VALUES
    (
      'shaker-doors',
      'Classic Shaker Cabinet Door',
      'classic-shaker-cabinet-door',
      'A durable maple Shaker door with a smooth, ready-to-finish surface.',
      89.00::numeric,
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1000&q=85'
    ),
    (
      'drawer-boxes',
      'Dovetail Maple Drawer Box',
      'dovetail-maple-drawer-box',
      'A solid maple dovetail drawer box, built for a precise fit and daily use.',
      64.50::numeric,
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=85'
    )
) AS seed(category_slug, name, slug, description, price, image_url)
JOIN categories AS category ON category.slug = seed.category_slug
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  is_active = true;
