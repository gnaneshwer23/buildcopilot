import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isBuildCopilotSnapshot } from "@/lib/buildcopilot-types";

const DATA_DIR = path.join(process.cwd(), "data");
const BUILDCOPILOT_STATE_FILE = path.join(DATA_DIR, "buildcopilot-state.json");

type BuildCopilotStateEnvelope = {
  updatedAt: string;
  state: unknown;
};

/**
 * Validates the top-level required keys of a BuildCopilot snapshot object.
 * Protects against malformed or injected payloads reaching the disk write.
 */
export function isValidSnapshotShape(value: unknown): boolean {
  return isBuildCopilotSnapshot(value);
}

export async function getBuildCopilotState(): Promise<BuildCopilotStateEnvelope | null> {
  try {
    const content = await readFile(BUILDCOPILOT_STATE_FILE, "utf8");
    const parsed = JSON.parse(content) as BuildCopilotStateEnvelope;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (typeof parsed.updatedAt !== "string") {
      return null;
    }

    if (!isBuildCopilotSnapshot(parsed.state)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function saveBuildCopilotState(state: unknown): Promise<BuildCopilotStateEnvelope> {
  const envelope: BuildCopilotStateEnvelope = {
    updatedAt: new Date().toISOString(),
    state,
  };

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(BUILDCOPILOT_STATE_FILE, JSON.stringify(envelope, null, 2), "utf8");

  return envelope;
}
