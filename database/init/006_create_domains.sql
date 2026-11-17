-- Domains Management Module.
-- There is NO projects table in SubFlow: project association is a free-text
-- project_name (selected from the distinct names already in use) plus a
-- reserved project_id column for a future projects integration. No FK on
-- project_id on purpose — deleting a domain never touches project records.
-- NOTE: existing databases (volume already initialised) never re-run these
-- init scripts, so lib/domains.ts bootstraps the same DDL lazily
-- (CREATE TABLE / INDEX IF NOT EXISTS) on first use. Keep the two in sync.
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_name TEXT NOT NULL,
  domain_type TEXT NOT NULL DEFAULT 'external',
  description TEXT,
  project_id UUID,
  project_name TEXT,
  purchased_from TEXT,
  purchase_date DATE,
  purchase_cost NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'INR',
  billing_cycle TEXT NOT NULL DEFAULT 'yearly',
  custom_billing_days INTEGER,
  invoice_reference TEXT,
  managed_by TEXT,
  management_platform TEXT,
  account_email TEXT,
  responsible_person TEXT,
  nameservers TEXT,
  registration_date DATE,
  expiry_date DATE,
  next_renewal_date DATE,
  renewal_cost NUMERIC(12,2),
  auto_renewal_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  renewal_reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_days_before INTEGER NOT NULL DEFAULT 7,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT domains_type_check CHECK (domain_type IN ('internal','external')),
  CONSTRAINT domains_status_check CHECK (status IN ('active','inactive','expired','pending','cancelled')),
  CONSTRAINT domains_billing_cycle_check CHECK (billing_cycle IN ('monthly','yearly','custom')),
  CONSTRAINT domains_purchase_cost_nonneg CHECK (purchase_cost IS NULL OR purchase_cost >= 0),
  CONSTRAINT domains_renewal_cost_nonneg CHECK (renewal_cost IS NULL OR renewal_cost >= 0),
  CONSTRAINT domains_reminder_days_check CHECK (reminder_days_before IN (3,7,15,30)),
  CONSTRAINT domains_custom_days_check CHECK (custom_billing_days IS NULL OR custom_billing_days > 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_domains_name_lower ON domains (LOWER(domain_name));
CREATE INDEX IF NOT EXISTS idx_domains_expiry ON domains (expiry_date);
CREATE INDEX IF NOT EXISTS idx_domains_status ON domains (status);
CREATE INDEX IF NOT EXISTS idx_domains_type ON domains (domain_type);
CREATE INDEX IF NOT EXISTS idx_domains_project ON domains (project_name);
