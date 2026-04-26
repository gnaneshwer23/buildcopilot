import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const DATA_FILE = path.join(process.cwd(), "data", "ideas.json");
const TABLE = "buildcopilot_ideas";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

async function main() {
  const supabaseUrl = requiredEnv("SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  const content = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(content);
  const items = Array.isArray(parsed?.items) ? parsed.items : [];

  if (items.length === 0) {
    console.log("No idea records found in data/ideas.json. Nothing to migrate.");
    return;
  }

  const rows = items.map((item) => ({
    idea_id: item.ideaId,
    payload: item,
    updated_at: new Date().toISOString(),
  }));

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from(TABLE).upsert(rows, {
    onConflict: "idea_id",
  });

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }

  console.log(`Migrated ${rows.length} records from ${DATA_FILE} to ${TABLE}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
