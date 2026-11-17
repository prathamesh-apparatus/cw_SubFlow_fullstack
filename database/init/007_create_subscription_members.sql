-- Subscription members ("Who can use this subscription").
-- A subscription's account email can be shared by several team members; this
-- table records who they are (name + optional email), one row per member.
-- Deleting a subscription cascades its members away with it.
-- NOTE: existing databases (volume already initialised) never re-run these
-- init scripts, so lib/subscriptions.ts bootstraps the same DDL lazily
-- (CREATE TABLE / INDEX IF NOT EXISTS) on first use. Keep the two in sync.
CREATE TABLE IF NOT EXISTS subscription_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscription_members_subscription ON subscription_members (subscription_id);
