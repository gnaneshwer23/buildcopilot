import { describe, expect, it } from "vitest";
import {
  createBuildCopilotSnapshot,
  isBuildCopilotSnapshot,
  type ActionLogEntry,
  type CaptureOutput,
  type KanbanCard,
  type PrdSection,
  type RoadmapItem,
  type TraceRow,
} from "@/lib/buildcopilot-types";

const captureOutput: CaptureOutput = {
  problem: "Manual release planning is fragmented.",
  users: ["Product manager"],
  goals: ["Reduce planning time"],
  value: "A single operating loop for delivery execution.",
};

const roadmap: RoadmapItem[] = [{ id: "r1", text: "Launch MVP", column: "now" }];
const prdSections: PrdSection[] = [
  {
    id: "p1",
    title: "Problem Statement",
    content: "Teams lose delivery context across tools.",
    open: true,
    improving: false,
    color: "blue",
  },
];
const cards: KanbanCard[] = [
  {
    id: "k1",
    title: "Persist roadmap edits",
    epic: "Strategy",
    priority: "high",
    estimate: 5,
    assignee: "AK",
    column: "inprogress",
    acceptance: ["Changes survive reload"],
    build: {
      commits: ["feat: persist roadmap #k1"],
      completedTaskCount: 2,
    },
  },
];
const rows: TraceRow[] = [
  {
    id: "t1",
    requirement: "REQ-001",
    epic: "Strategy",
    story: "Persist roadmap edits",
    linkedCardId: "k1",
    commit: null,
    testCase: null,
    status: "missing",
    expanded: false,
  },
];
const actionLog: ActionLogEntry[] = [
  {
    id: "al-1",
    actionId: "s4",
    label: "Generate user stories",
    status: "success",
    message: "Generated 2 stories.",
    timestamp: "2026-04-25T00:00:00.000Z",
  },
];

describe("createBuildCopilotSnapshot", () => {
  it("creates a complete snapshot from shared BuildCopilot state inputs", () => {
    const snapshot = createBuildCopilotSnapshot({
      ideaText: "Build a delivery cockpit",
      captureOutput,
      vision: "Unify execution context",
      usp: "Traceability across the loop",
      vp: "Faster delivery decisions",
      roadmap,
      prdSections,
      prdVersion: 3,
      cards,
      rows,
      actionLog,
    });

    expect(snapshot).toEqual({
      ideaText: "Build a delivery cockpit",
      captureOutput,
      vision: "Unify execution context",
      usp: "Traceability across the loop",
      vp: "Faster delivery decisions",
      roadmap,
      prdSections,
      prdVersion: 3,
      cards,
      rows,
      actionLog,
    });
  });

  it("supports assistant-action overrides without dropping optional actionLog", () => {
    const computedRows: TraceRow[] = [{ ...rows[0], status: "complete", commit: "feat: persist", testCase: "TC-001" }];

    const snapshot = createBuildCopilotSnapshot({
      ideaText: "Build a delivery cockpit",
      captureOutput,
      vision: "Unify execution context",
      usp: "Traceability across the loop",
      vp: "Faster delivery decisions",
      roadmap,
      prdSections,
      prdVersion: 3,
      cards,
      rows: computedRows,
      actionLog,
    });

    expect(snapshot.rows).toEqual(computedRows);
    expect(snapshot.actionLog).toEqual(actionLog);
  });

  it("identifies a valid BuildCopilot snapshot", () => {
    const snapshot = createBuildCopilotSnapshot({
      ideaText: "Build a delivery cockpit",
      captureOutput,
      vision: "Unify execution context",
      usp: "Traceability across the loop",
      vp: "Faster delivery decisions",
      roadmap,
      prdSections,
      prdVersion: 3,
      cards,
      rows,
      actionLog,
    });

    expect(isBuildCopilotSnapshot(snapshot)).toBe(true);
  });

  it("rejects snapshots with malformed nested state", () => {
    expect(
      isBuildCopilotSnapshot({
        ideaText: "Build a delivery cockpit",
        captureOutput: { problem: "x", users: "bad", goals: [], value: "ok" },
        vision: "Unify execution context",
        usp: "Traceability across the loop",
        vp: "Faster delivery decisions",
        roadmap,
        prdSections,
        prdVersion: 3,
        cards,
        rows,
      }),
    ).toBe(false);
  });

  it("rejects snapshots with malformed card build shape", () => {
    expect(
      isBuildCopilotSnapshot({
        ideaText: "Build a delivery cockpit",
        captureOutput,
        vision: "Unify execution context",
        usp: "Traceability across the loop",
        vp: "Faster delivery decisions",
        roadmap,
        prdSections,
        prdVersion: 3,
        cards: [{ ...cards[0], build: { commits: ["feat: x"], completedTaskCount: "2" } }],
        rows,
      }),
    ).toBe(false);
  });

  it("rejects snapshots with malformed trace row links", () => {
    expect(
      isBuildCopilotSnapshot({
        ideaText: "Build a delivery cockpit",
        captureOutput,
        vision: "Unify execution context",
        usp: "Traceability across the loop",
        vp: "Faster delivery decisions",
        roadmap,
        prdSections,
        prdVersion: 3,
        cards,
        rows: [{ ...rows[0], linkedCardId: 100 }],
      }),
    ).toBe(false);
  });

  it("rejects snapshots when linkedCardId does not resolve to a card", () => {
    expect(
      isBuildCopilotSnapshot({
        ideaText: "Build a delivery cockpit",
        captureOutput,
        vision: "Unify execution context",
        usp: "Traceability across the loop",
        vp: "Faster delivery decisions",
        roadmap,
        prdSections,
        prdVersion: 3,
        cards,
        rows: [{ ...rows[0], linkedCardId: "k999" }],
      }),
    ).toBe(false);
  });
});