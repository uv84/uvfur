CREATE TABLE IF NOT EXISTS catalog_migrations (
  migration_name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products
ADD COLUMN IF NOT EXISTS flipkart_price numeric(10, 2)
  CHECK (flipkart_price IS NULL OR flipkart_price >= 0);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM catalog_migrations
    WHERE migration_name = '003_flipkart_prices'
  ) THEN
    UPDATE products AS product
    SET flipkart_price = seed.flipkart_price
    FROM (
      VALUES
        ('sample-front-load-washing-machine', 41990),
        ('sample-built-in-oven', 53990),
        ('sample-mixer-grinder', 7290),
        ('sample-air-fryer', 9790),
        ('sample-dishwasher', 48990),
        ('sample-refrigerator', 68990),
        ('sample-food-processor', 13490),
        ('sample-hand-blender', 5290),
        ('sample-coffee-machine', 12490),
        ('sample-cordless-vacuum-cleaner', 21490),
        ('sample-appliance-care-product', 1190)
    ) AS seed(slug, flipkart_price)
    WHERE product.slug = seed.slug;

    INSERT INTO catalog_migrations (migration_name)
    VALUES ('003_flipkart_prices');
  END IF;
END
$$;
