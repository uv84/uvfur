ALTER TABLE site_banner
  ADD COLUMN IF NOT EXISTS festival_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_festive_offer boolean NOT NULL DEFAULT false;
