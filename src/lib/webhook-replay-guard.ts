import { registerWebhookReplayKey } from "@/lib/persistence";

const DEFAULT_TTL_SECONDS = 600;
const MIN_TTL_SECONDS = 60;
const MAX_TTL_SECONDS = 24 * 60 * 60;

export async function registerSchedulerWebhookReplay(
  signature: string,
  timestampSeconds: number,
): Promise<{ ok: true } | { ok: false; reason: string; status: number }> {
  const now = new Date();
  const ttlSeconds = getReplayTtlSeconds();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
  const key = `${timestampSeconds}:${signature}`;

  try {
    const result = await registerWebhookReplayKey({
      replayKey: key,
      nowIso: now.toISOString(),
      expiresAtIso: expiresAt.toISOString(),
    });

    if (result === "duplicate") {
      return {
        ok: false,
        reason: "Replay detected for scheduler webhook payload.",
        status: 409,
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      reason: "Replay protection store unavailable.",
      status: 503,
    };
  }
}

function getReplayTtlSeconds(): number {
  const raw = process.env.BUILDCOPILOT_SCHEDULER_WEBHOOK_REPLAY_TTL_SECONDS;
  const parsed = Number(raw);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_TTL_SECONDS;
  }

  const rounded = Math.floor(parsed);
  return Math.min(Math.max(rounded, MIN_TTL_SECONDS), MAX_TTL_SECONDS);
}
