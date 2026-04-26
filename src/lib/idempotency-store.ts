/**
 * Persistent idempotency cache backend.
 *
 * In file mode: stores responses in data/idempotency-cache.json (single-instance).
 * In supabase mode: stores responses in buildcopilot_idempotency_cache table (multi-instance safe).
 *
 * Falls back to file mode if Supabase is not reachable.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const DATA_DIR = path.join(process.cwd(), "data");
const CACHE_FILE = path.join(DATA_DIR, "idempotency-cache.json");
const SUPABASE_TABLE = "buildcopilot_idempotency_cache";

// ─── Types ────────────────────────────────────────────────────────────────────

type CacheEntry = {
  cacheKey: string;
  requestHash: string;
  status: number;
  body: unknown;
  expiresAtMs: number;
};

type CacheStore = {
  entries: CacheEntry[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function hashRequest(body: unknown): string {
  return createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

export function makeCacheKey(scope: string, idempotencyKey: string): string {
  return `${scope}:${idempotencyKey}`;
}

function getPersistenceMode(): "file" | "supabase" {
  const mode = process.env.BUILDCOPILOT_PERSISTENCE?.toLowerCase();
  return mode === "supabase" ? "supabase" : "file";
}

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ─── File backend ─────────────────────────────────────────────────────────────

async function ensureCacheStore(): Promise<CacheStore> {
  try {
    const content = await readFile(CACHE_FILE, "utf8");
    const parsed = JSON.parse(content) as CacheStore;
    return { entries: parsed.entries ?? [] };
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
    const initial: CacheStore = { entries: [] };
    await writeFile(CACHE_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

async function saveCacheStore(store: CacheStore): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(store, null, 2), "utf8");
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type IdempotencyLookupResult =
  | { state: "miss" }
  | { state: "hit"; status: number; body: unknown }
  | { state: "conflict" };

export async function lookupPersistentIdempotentResponse(options: {
  scope: string;
  idempotencyKey: string;
  requestBody: unknown;
}): Promise<IdempotencyLookupResult> {
  const cacheKey = makeCacheKey(options.scope, options.idempotencyKey);
  const reqHash = hashRequest(options.requestBody);
  const nowMs = Date.now();
  const mode = getPersistenceMode();

  if (mode === "supabase") {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data } = await supabase
        .from(SUPABASE_TABLE)
        .select("request_hash, status, body, expires_at_ms")
        .eq("cache_key", cacheKey)
        .single();

      if (!data) return { state: "miss" };
      if (data.expires_at_ms <= nowMs) {
        await supabase.from(SUPABASE_TABLE).delete().eq("cache_key", cacheKey);
        return { state: "miss" };
      }
      if (data.request_hash !== reqHash) return { state: "conflict" };
      return { state: "hit", status: data.status as number, body: data.body };
    }
  }

  // File backend
  const store = await ensureCacheStore();
  const entry = store.entries.find((e) => e.cacheKey === cacheKey);
  if (!entry) return { state: "miss" };
  if (entry.expiresAtMs <= nowMs) return { state: "miss" };
  if (entry.requestHash !== reqHash) return { state: "conflict" };
  return { state: "hit", status: entry.status, body: entry.body };
}

export async function savePersistentIdempotentResponse(options: {
  scope: string;
  idempotencyKey: string;
  requestBody: unknown;
  status: number;
  body: unknown;
  ttlMs?: number;
}): Promise<void> {
  const cacheKey = makeCacheKey(options.scope, options.idempotencyKey);
  const reqHash = hashRequest(options.requestBody);
  const nowMs = Date.now();
  const ttlMs = Math.max(options.ttlMs ?? 60 * 60 * 1000, 30_000);
  const expiresAtMs = nowMs + ttlMs;
  const mode = getPersistenceMode();

  if (mode === "supabase") {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from(SUPABASE_TABLE).upsert(
        {
          cache_key: cacheKey,
          request_hash: reqHash,
          status: options.status,
          body: options.body,
          expires_at_ms: expiresAtMs,
        },
        { onConflict: "cache_key" },
      );
      return;
    }
  }

  // File backend
  const store = await ensureCacheStore();
  const nowPurged = store.entries.filter((e) => e.expiresAtMs > nowMs);
  const existingIdx = nowPurged.findIndex((e) => e.cacheKey === cacheKey);
  const newEntry: CacheEntry = {
    cacheKey,
    requestHash: reqHash,
    status: options.status,
    body: options.body,
    expiresAtMs,
  };
  if (existingIdx >= 0) {
    nowPurged[existingIdx] = newEntry;
  } else {
    nowPurged.push(newEntry);
  }
  // Bound file size to 10000 entries (drop oldest)
  const bounded = nowPurged.length > 10_000
    ? nowPurged.slice(nowPurged.length - 10_000)
    : nowPurged;
  await saveCacheStore({ entries: bounded });
}
