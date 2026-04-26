import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { IdeaRecord, WebhookReplayMetricsResponse } from "@/lib/buildcopilot-types";

export type IdeaStore = {
  items: IdeaRecord[];
};

type ReplayLedgerStore = {
  items: Array<{
    replayKey: string;
    expiresAt: string;
  }>;
};

export type PersistenceMode = "file" | "supabase";

export type PersistenceHealth = {
  mode: PersistenceMode;
  configured: boolean;
  connected: boolean;
  usingFallback: boolean;
  reason?: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "ideas.json");
const REPLAY_LEDGER_FILE = path.join(DATA_DIR, "webhook-replay-ledger.json");
const SUPABASE_TABLE = "buildcopilot_ideas";
const SUPABASE_REPLAY_TABLE = "buildcopilot_webhook_replays";

export function getPersistenceMode(): PersistenceMode {
  const mode = process.env.BUILDCOPILOT_PERSISTENCE?.toLowerCase();
  return mode === "supabase" ? "supabase" : "file";
}

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function ensureStore(): Promise<IdeaStore> {
  const mode = getPersistenceMode();

  if (mode === "supabase") {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .select("payload")
        .order("updated_at", { ascending: false });

      if (!error && data) {
        return {
          items: data
            .map((row) => row.payload as IdeaRecord)
            .filter((item) => Boolean(item?.ideaId)),
        };
      }
    }
  }

  return ensureFileStore();
}

export async function getPersistenceHealth(): Promise<PersistenceHealth> {
  const mode = getPersistenceMode();

  if (mode === "file") {
    return {
      mode,
      configured: true,
      connected: true,
      usingFallback: false,
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      mode,
      configured: false,
      connected: false,
      usingFallback: true,
      reason: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    };
  }

  const { error } = await supabase
    .from(SUPABASE_TABLE)
    .select("idea_id")
    .limit(1);

  if (error) {
    return {
      mode,
      configured: true,
      connected: false,
      usingFallback: true,
      reason: error.message,
    };
  }

  return {
    mode,
    configured: true,
    connected: true,
    usingFallback: false,
  };
}

export async function saveStore(store: IdeaStore): Promise<void> {
  const mode = getPersistenceMode();

  if (mode === "supabase") {
    const supabase = getSupabaseClient();
    if (supabase) {
      const rows = store.items.map((item) => ({
        idea_id: item.ideaId,
        payload: item,
        updated_at: new Date().toISOString(),
      }));

      if (rows.length > 0) {
        const { error } = await supabase
          .from(SUPABASE_TABLE)
          .upsert(rows, { onConflict: "idea_id" });

        if (!error) {
          return;
        }
      } else {
        return;
      }
    }
  }

  await saveFileStore(store);
}

async function ensureFileStore(): Promise<IdeaStore> {
  try {
    const content = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(content) as IdeaStore;
    return { items: parsed.items ?? [] };
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
    const initial: IdeaStore = { items: [] };
    await writeFile(DATA_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

async function saveFileStore(store: IdeaStore): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function registerWebhookReplayKey(options: {
  replayKey: string;
  nowIso: string;
  expiresAtIso: string;
}): Promise<"accepted" | "duplicate"> {
  const mode = getPersistenceMode();

  if (mode === "supabase") {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase
        .from(SUPABASE_REPLAY_TABLE)
        .delete()
        .lte("expires_at", options.nowIso);

      const { error } = await supabase
        .from(SUPABASE_REPLAY_TABLE)
        .insert({
          replay_key: options.replayKey,
          expires_at: options.expiresAtIso,
        });

      if (!error) {
        return "accepted";
      }

      if (error.code === "23505") {
        return "duplicate";
      }
    }
  }

  return registerWebhookReplayKeyInFile(options);
}

async function registerWebhookReplayKeyInFile(options: {
  replayKey: string;
  nowIso: string;
  expiresAtIso: string;
}): Promise<"accepted" | "duplicate"> {
  const store = await ensureReplayLedgerStore();
  const nowMs = new Date(options.nowIso).getTime();
  const nextItems = store.items.filter((item) => {
    const expiresMs = new Date(item.expiresAt).getTime();
    return Number.isFinite(expiresMs) && expiresMs > nowMs;
  });

  if (nextItems.some((item) => item.replayKey === options.replayKey)) {
    await saveReplayLedgerStore({ items: nextItems });
    return "duplicate";
  }

  nextItems.push({
    replayKey: options.replayKey,
    expiresAt: options.expiresAtIso,
  });

  await saveReplayLedgerStore({ items: nextItems.slice(-20000) });
  return "accepted";
}

async function ensureReplayLedgerStore(): Promise<ReplayLedgerStore> {
  try {
    const content = await readFile(REPLAY_LEDGER_FILE, "utf8");
    const parsed = JSON.parse(content) as ReplayLedgerStore;
    return { items: parsed.items ?? [] };
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
    const initial: ReplayLedgerStore = { items: [] };
    await writeFile(REPLAY_LEDGER_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

async function saveReplayLedgerStore(store: ReplayLedgerStore): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(REPLAY_LEDGER_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function getReplayLedgerMetrics(): Promise<WebhookReplayMetricsResponse> {
  const collectedAt = new Date().toISOString();
  const nowMs = Date.now();
  const mode = getPersistenceMode();

  if (mode === "supabase") {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: allRows } = await supabase
        .from(SUPABASE_REPLAY_TABLE)
        .select("replay_key, expires_at")
        .order("expires_at", { ascending: true });

      const rows = allRows ?? [];
      const activeRows = rows.filter((r) => new Date(r.expires_at).getTime() > nowMs);
      const expiredRows = rows.filter((r) => new Date(r.expires_at).getTime() <= nowMs);
      const activeTimes = activeRows.map((r) => r.expires_at as string);

      return {
        collectedAt,
        backend: "supabase",
        totalEntries: rows.length,
        activeEntries: activeRows.length,
        expiredEntries: expiredRows.length,
        oldestActiveExpiresAt: activeTimes.length > 0 ? activeTimes[0] : undefined,
        newestActiveExpiresAt: activeTimes.length > 0 ? activeTimes[activeTimes.length - 1] : undefined,
      };
    }
  }

  const store = await ensureReplayLedgerStore();
  const activeItems = store.items.filter((item) => {
    const expiresMs = new Date(item.expiresAt).getTime();
    return Number.isFinite(expiresMs) && expiresMs > nowMs;
  });
  const expiredItems = store.items.filter((item) => {
    const expiresMs = new Date(item.expiresAt).getTime();
    return !Number.isFinite(expiresMs) || expiresMs <= nowMs;
  });
  const sortedActive = [...activeItems].sort(
    (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
  );

  return {
    collectedAt,
    backend: "file",
    totalEntries: store.items.length,
    activeEntries: activeItems.length,
    expiredEntries: expiredItems.length,
    oldestActiveExpiresAt: sortedActive.length > 0 ? sortedActive[0].expiresAt : undefined,
    newestActiveExpiresAt: sortedActive.length > 0 ? sortedActive[sortedActive.length - 1].expiresAt : undefined,
  };
}
