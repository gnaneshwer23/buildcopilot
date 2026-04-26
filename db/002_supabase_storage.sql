-- BuildCopilot AI - Supabase persistence adapter support
-- Stores full idea artifacts as JSONB while keeping idea_id as stable key.

CREATE TABLE IF NOT EXISTS buildcopilot_ideas (
  idea_id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_buildcopilot_ideas_updated_at
  ON buildcopilot_ideas(updated_at DESC);
