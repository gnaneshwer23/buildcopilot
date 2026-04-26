import { describe, expect, it } from "vitest";
import { normalizeBuildCopilotSnapshot } from "@/lib/buildcopilot-snapshot-normalization";
import { isBuildCopilotSnapshot, type BuildCopilotSnapshot } from "@/lib/buildcopilot-types";

const legacySnapshot = (): BuildCopilotSnapshot => ({
  ideaText: "Build delivery intelligence cockpit",
  captureOutput: null,
  vision: "Unify execution context",
  usp: "Traceability from idea to release",
  vp: "Faster delivery cycles",
  roadmap: [{ id: "r1", text: "Launch MVP", column: "now" }],
  prdSections: [
    {
      id: "p1",
      title: "Problem",
      content: "Context drifts across tools",
      open: true,
      improving: false,
      color: "blue",
    },
  ],
  prdVersion: 3,
  cards: [
    {
      id: "k1",
      title: "Capture form",
      epic: "Capture",
      priority: "high",
      estimate: 3,
      assignee: "AK",
      column: "done",
      acceptance: ["Structured output"],
      build: {
        commits: ["feat: capture form #k1"],
        completedTaskCount: 3,
      },
    },
  ],
  rows: [
    {
      id: "t1",
      requirement: "REQ-001",
      epic: "Capture",
      story: "Capture form",
      commit: null,
      testCase: null,
      status: "missing",
      expanded: false,
    },
  ],
});

describe("normalizeBuildCopilotSnapshot", () => {
  it("backfills linkedCardId for legacy rows when match is unique", () => {
    const normalized = normalizeBuildCopilotSnapshot(legacySnapshot());
    expect(normalized.rows[0]?.linkedCardId).toBe("k1");
  });

  it("is idempotent and preserves linkage across JSON round trips", () => {
    const normalized = normalizeBuildCopilotSnapshot(legacySnapshot());
    const roundTrip = JSON.parse(JSON.stringify(normalized)) as unknown;

    expect(isBuildCopilotSnapshot(roundTrip)).toBe(true);

    const normalizedAgain = normalizeBuildCopilotSnapshot(roundTrip as BuildCopilotSnapshot);
    expect(normalizedAgain.rows[0]?.linkedCardId).toBe("k1");
    expect(normalizedAgain.rows).toEqual(normalized.rows);
  });
});
