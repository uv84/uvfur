CREATE TABLE IF NOT EXISTS catalog_migrations (
  migration_name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM catalog_migrations
    WHERE migration_name = '002_bosch_amazon_prices'
  ) THEN
    UPDATE products
    SET amazon_price = bosch_price,
        bosch_price = amazon_price;

    INSERT INTO catalog_migrations (migration_name)
    VALUES ('002_bosch_amazon_prices');
  END IF;
END
$$;

UPDATE products AS product
SET bosch_price = seed.bosch_price,
    amazon_price = seed.amazon_price
FROM (
  VALUES
    ('sample-front-load-washing-machine', 47990, 42990),
    ('sample-built-in-oven', 59990, 54990),
    ('sample-mixer-grinder', 8490, 7490),
    ('sample-air-fryer', 11990, 9990),
    ('sample-dishwasher', 54990, 49990),
    ('sample-refrigerator', 74990, 69990),
    ('sample-food-processor', 15990, 13990),
    ('sample-hand-blender', 6490, 5490),
    ('sample-coffee-machine', 14990, 12990),
    ('sample-cordless-vacuum-cleaner', 24990, 21990),
    ('sample-appliance-care-product', 1490, 1290)
) AS seed(slug, bosch_price, amazon_price)
WHERE product.slug = seed.slug;
