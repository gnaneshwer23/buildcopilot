-- Migration: 004_idempotency_cache
-- Persistent idempotency cache for multi-instance bulk operations.

CREATE TABLE IF NOT EXISTS buildcopilot_idempotency_cache (
  cache_key      TEXT        NOT NULL PRIMARY KEY,
  request_hash   TEXT        NOT NULL,
  status         INTEGER     NOT NULL,
  body           JSONB       NOT NULL,
  expires_at_ms  BIGINT      NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast expired-entry queries
CREATE INDEX IF NOT EXISTS buildcopilot_idempotency_cache_expires_at_ms_idx
  ON buildcopilot_idempotency_cache (expires_at_ms);

-- Row-level security (read-only from anon; service role has full access)
ALTER TABLE buildcopilot_idempotency_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access" ON buildcopilot_idempotency_cache
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
