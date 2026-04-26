import { createHash } from "node:crypto";
import {
  lookupPersistentIdempotentResponse,
  savePersistentIdempotentResponse,
} from "@/lib/idempotency-store";

type StoredResponse = {
  requestHash: string;
  status: number;
  body: unknown;
  expiresAtMs: number;
};

type IdempotencyStore = {
  responses: Map<string, StoredResponse>;
};

const GLOBAL_KEY = "__buildcopilot_idempotency_store__";

function getStore(): IdempotencyStore {
  const globalWithStore = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: IdempotencyStore;
  };

  if (!globalWithStore[GLOBAL_KEY]) {
    globalWithStore[GLOBAL_KEY] = {
      responses: new Map<string, StoredResponse>(),
    };
  }

  return globalWithStore[GLOBAL_KEY];
}

function hashRequest(body: unknown): string {
  return createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

function makeKey(scope: string, idempotencyKey: string): string {
  return `${scope}:${idempotencyKey}`;
}

function cleanupExpired(store: IdempotencyStore) {
  const now = Date.now();
  for (const [key, value] of store.responses.entries()) {
    if (value.expiresAtMs <= now) {
      store.responses.delete(key);
    }
  }
}

/** Fast in-memory check (sync). Returns null on miss so caller falls through to persistent store. */
function lookupInMemory(
  scope: string,
  idempotencyKey: string,
  requestBody: unknown,
): { state: "miss" } | { state: "hit"; status: number; body: unknown } | { state: "conflict" } {
  const store = getStore();
  cleanupExpired(store);
  const key = makeKey(scope, idempotencyKey);
  const existing = store.responses.get(key);
  if (!existing) return { state: "miss" };
  const requestHash = hashRequest(requestBody);
  if (existing.requestHash !== requestHash) return { state: "conflict" };
  return { state: "hit", status: existing.status, body: existing.body };
}

function saveInMemory(options: {
  scope: string;
  idempotencyKey: string;
  requestBody: unknown;
  status: number;
  body: unknown;
  ttlMs?: number;
}) {
  const store = getStore();
  cleanupExpired(store);
  const ttlMs = Math.max(options.ttlMs ?? 60 * 60 * 1000, 30_000);
  const key = makeKey(options.scope, options.idempotencyKey);
  store.responses.set(key, {
    requestHash: hashRequest(options.requestBody),
    status: options.status,
    body: options.body,
    expiresAtMs: Date.now() + ttlMs,
  });
}

// ─── Public API (async — persistent + in-memory) ──────────────────────────────

export async function lookupIdempotentResponse(options: {
  scope: string;
  idempotencyKey: string;
  requestBody: unknown;
}): Promise<
  | { state: "miss" }
  | { state: "hit"; status: number; body: unknown }
  | { state: "conflict" }
> {
  // 1. Fast in-memory check
  const memResult = lookupInMemory(options.scope, options.idempotencyKey, options.requestBody);
  if (memResult.state !== "miss") return memResult;

  // 2. Persistent backend check
  try {
    const persistResult = await lookupPersistentIdempotentResponse(options);
    if (persistResult.state === "hit") {
      // Populate in-memory cache so next call is fast
      saveInMemory({
        scope: options.scope,
        idempotencyKey: options.idempotencyKey,
        requestBody: options.requestBody,
        status: persistResult.status,
        body: persistResult.body,
      });
    }
    return persistResult;
  } catch {
    // Persistent store unavailable — treat as miss
    return { state: "miss" };
  }
}

export async function saveIdempotentResponse(options: {
  scope: string;
  idempotencyKey: string;
  requestBody: unknown;
  status: number;
  body: unknown;
  ttlMs?: number;
}): Promise<void> {
  // Write to both stores; in-memory is synchronous so it's always populated
  saveInMemory(options);
  try {
    await savePersistentIdempotentResponse(options);
  } catch {
    // Persistent write failure is non-fatal — in-memory cache still works
  }
}
