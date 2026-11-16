CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT categories_name_not_blank CHECK (char_length(btrim(name)) > 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name_lower ON categories (lower(name));
