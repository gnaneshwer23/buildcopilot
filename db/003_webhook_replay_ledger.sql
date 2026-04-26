-- BuildCopilot AI - persistent webhook replay ledger
-- Enables duplicate webhook protection across multiple app instances.

CREATE TABLE IF NOT EXISTS buildcopilot_webhook_replays (
  replay_key TEXT PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_buildcopilot_webhook_replays_expires_at
  ON buildcopilot_webhook_replays(expires_at ASC);
