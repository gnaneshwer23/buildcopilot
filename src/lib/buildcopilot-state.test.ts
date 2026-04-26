import { describe, it, expect } from "vitest";
import { isValidSnapshotShape } from "@/lib/buildcopilot-state";

const validSnapshot = () => ({
  ideaText: "An idea",
  captureOutput: null,
  vision: "Our vision",
  usp: "Our USP",
  vp: "Value prop",
  roadmap: [{ id: "r1", text: "Plan MVP", column: "now" }],
  prdSections: [
    {
      id: "p1",
      title: "Problem",
      content: "Delivery context drift",
      open: true,
      improving: false,
      color: "blue",
    },
  ],
  cards: [
    {
      id: "k1",
      title: "Persist snapshot state",
      epic: "Strategy",
      priority: "high",
      estimate: 3,
      assignee: "AK",
      column: "inprogress",
      acceptance: ["Save and reload succeeds"],
      build: {
        commits: ["feat: persist snapshot #k1"],
        completedTaskCount: 1,
      },
    },
  ],
  rows: [
    {
      id: "t1",
      requirement: "REQ-001",
      epic: "Strategy",
      story: "Persist snapshot state",
      linkedCardId: "k1",
      commit: null,
      testCase: null,
      status: "missing",
      expanded: false,
    },
  ],
  prdVersion: 1,
});

describe("isValidSnapshotShape", () => {
  it("accepts a fully valid snapshot", () => {
    expect(isValidSnapshotShape(validSnapshot())).toBe(true);
  });

  it("accepts snapshots with extra unknown keys", () => {
    expect(isValidSnapshotShape({ ...validSnapshot(), extraField: "ok" })).toBe(true);
  });

  it("rejects null", () => {
    expect(isValidSnapshotShape(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isValidSnapshotShape(undefined)).toBe(false);
  });

  it("rejects an array", () => {
    expect(isValidSnapshotShape([])).toBe(false);
  });

  it("rejects a plain string", () => {
    expect(isValidSnapshotShape("not-an-object")).toBe(false);
  });

  it.each(["ideaText", "vision", "usp", "vp"])(
    "rejects when required string key '%s' is missing",
    (key) => {
      const snap = validSnapshot() as Record<string, unknown>;
      delete snap[key];
      expect(isValidSnapshotShape(snap)).toBe(false);
    },
  );

  it.each(["ideaText", "vision", "usp", "vp"])(
    "rejects when required string key '%s' is not a string",
    (key) => {
      const snap = { ...validSnapshot(), [key]: 123 };
      expect(isValidSnapshotShape(snap)).toBe(false);
    },
  );

  it.each(["roadmap", "prdSections", "cards", "rows"])(
    "rejects when required array key '%s' is missing",
    (key) => {
      const snap = validSnapshot() as Record<string, unknown>;
      delete snap[key];
      expect(isValidSnapshotShape(snap)).toBe(false);
    },
  );

  it.each(["roadmap", "prdSections", "cards", "rows"])(
    "rejects when required array key '%s' is not an array",
    (key) => {
      const snap = { ...validSnapshot(), [key]: "not-array" };
      expect(isValidSnapshotShape(snap)).toBe(false);
    },
  );

  it("rejects when prdVersion is missing", () => {
    const snap = validSnapshot() as Record<string, unknown>;
    delete snap["prdVersion"];
    expect(isValidSnapshotShape(snap)).toBe(false);
  });

  it("rejects when prdVersion is a string", () => {
    expect(isValidSnapshotShape({ ...validSnapshot(), prdVersion: "1" })).toBe(false);
  });

  it("rejects when prdVersion is null", () => {
    expect(isValidSnapshotShape({ ...validSnapshot(), prdVersion: null })).toBe(false);
  });

  it("rejects when captureOutput is missing", () => {
    const snap = validSnapshot() as Record<string, unknown>;
    delete snap["captureOutput"];
    expect(isValidSnapshotShape(snap)).toBe(false);
  });

  it("accepts captureOutput as null", () => {
    expect(isValidSnapshotShape({ ...validSnapshot(), captureOutput: null })).toBe(true);
  });

  it("accepts captureOutput with the expected shape", () => {
    expect(
      isValidSnapshotShape({
        ...validSnapshot(),
        captureOutput: {
          problem: "Manual planning causes drift.",
          users: ["PM"],
          goals: ["Reduce planning time"],
          value: "Shared execution context",
        },
      }),
    ).toBe(true);
  });

  it("rejects malformed captureOutput", () => {
    expect(
      isValidSnapshotShape({
        ...validSnapshot(),
        captureOutput: { problem: "x", users: "not-array", goals: [], value: "ok" },
      }),
    ).toBe(false);
  });

  it("accepts valid actionLog entries", () => {
    expect(
      isValidSnapshotShape({
        ...validSnapshot(),
        actionLog: [
          {
            id: "al-1",
            actionId: "s4",
            label: "Generate user stories",
            status: "success",
            message: "Generated 2 stories.",
            timestamp: "2026-04-25T00:00:00.000Z",
          },
        ],
      }),
    ).toBe(true);
  });

  it("rejects malformed actionLog entries", () => {
    expect(
      isValidSnapshotShape({
        ...validSnapshot(),
        actionLog: [{ id: "al-1", actionId: "s4", label: "x", status: "pending" }],
      }),
    ).toBe(false);
  });

  it("accepts prdVersion of 0", () => {
    expect(isValidSnapshotShape({ ...validSnapshot(), prdVersion: 0 })).toBe(true);
  });

  it("rejects malformed nested card build metadata", () => {
    expect(
      isValidSnapshotShape({
        ...validSnapshot(),
        cards: [
          {
            ...validSnapshot().cards[0],
            build: { commits: [123], completedTaskCount: "1" },
          },
        ],
      }),
    ).toBe(false);
  });

  it("rejects malformed nested trace row link shape", () => {
    expect(
      isValidSnapshotShape({
        ...validSnapshot(),
        rows: [
          {
            ...validSnapshot().rows[0],
            linkedCardId: 42,
          },
        ],
      }),
    ).toBe(false);
  });

  it("rejects trace rows linking to unknown cards", () => {
    expect(
      isValidSnapshotShape({
        ...validSnapshot(),
        rows: [
          {
            ...validSnapshot().rows[0],
            linkedCardId: "k-missing",
          },
        ],
      }),
    ).toBe(false);
  });

  it("rejects invalid roadmap item shape", () => {
    expect(
      isValidSnapshotShape({
        ...validSnapshot(),
        roadmap: [{ id: "r1", text: "Plan MVP", column: "immediately" }],
      }),
    ).toBe(false);
  });

  it("rejects invalid PRD section shape", () => {
    expect(
      isValidSnapshotShape({
        ...validSnapshot(),
        prdSections: [{ id: "p1", title: "Problem", content: "x", open: "yes", improving: false, color: "blue" }],
      }),
    ).toBe(false);
  });
});
