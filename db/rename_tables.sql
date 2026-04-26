-- BuildCopilot Rebranding - Table Renaming
-- Run this in your Supabase SQL Editor to migrate existing tables

ALTER TABLE IF EXISTS buildos_ideas RENAME TO buildcopilot_ideas;
ALTER TABLE IF EXISTS buildos_webhook_replays RENAME TO buildcopilot_webhook_replays;
ALTER TABLE IF EXISTS buildos_idempotency_cache RENAME TO buildcopilot_idempotency_cache;

-- Update index names if you want to be perfect (optional but recommended)
ALTER INDEX IF EXISTS idx_buildos_ideas_updated_at RENAME TO idx_buildcopilot_ideas_updated_at;
ALTER INDEX IF EXISTS idx_buildos_webhook_replays_expires_at RENAME TO idx_buildcopilot_webhook_replays_expires_at;
ALTER INDEX IF EXISTS idx_buildos_idempotency_cache_expires_at RENAME TO idx_buildcopilot_idempotency_cache_expires_at;
