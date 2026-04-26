import { backfillTraceRowLinks } from "@/lib/buildcopilot-traceability";
import type { BuildCopilotSnapshot } from "@/lib/buildcopilot-types";

export function normalizeBuildCopilotSnapshot(snapshot: BuildCopilotSnapshot): BuildCopilotSnapshot {
  return {
    ...snapshot,
    rows: backfillTraceRowLinks(snapshot.rows, snapshot.cards),
  };
}
