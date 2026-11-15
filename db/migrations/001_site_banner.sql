CREATE TABLE IF NOT EXISTS site_banner (
  id smallint PRIMARY KEY CHECK (id = 1),
  image_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
