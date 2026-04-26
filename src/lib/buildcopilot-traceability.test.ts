import { describe, expect, it } from "vitest";
import {
  backfillTraceRowLinks,
  deriveTraceRows,
  updateTraceRowById,
} from "@/lib/buildcopilot-traceability";
import type { KanbanCard, TraceRow } from "@/lib/buildcopilot-types";

const rows: TraceRow[] = [
  {
    id: "t1",
    requirement: "REQ-001",
    epic: "Capture",
    story: "Capture form",
    linkedCardId: "k1",
    commit: null,
    testCase: null,
    status: "missing",
    expanded: false,
  },
  {
    id: "t2",
    requirement: "REQ-002",
    epic: "Build",
    story: "Sprint dashboard",
    linkedCardId: "k2",
    commit: "manual-commit",
    testCase: null,
    status: "partial",
    expanded: false,
  },
];

const cards: KanbanCard[] = [
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
      commits: ["feat: capture form #k1-persisted"],
      completedTaskCount: 1,
    },
  },
  {
    id: "k2",
    title: "Sprint dashboard",
    epic: "Build",
    priority: "medium",
    estimate: 5,
    assignee: "LM",
    column: "inprogress",
    acceptance: ["Progress visible"],
  },
];

describe("buildcopilot-traceability helpers", () => {
  it("derives commit and test case fallbacks from linked cards", () => {
    expect(deriveTraceRows(rows, cards)[0]).toEqual({
      ...rows[0],
      commit: "feat: capture form #k1-persisted",
      testCase: "TC-K1 Flow validation",
      status: "complete",
    });
  });

  it("preserves manual commit values while deriving remaining trace fields", () => {
    expect(deriveTraceRows(rows, cards)[1]).toEqual({
      ...rows[1],
      commit: "manual-commit",
      testCase: "TC-K2 Flow validation",
      status: "complete",
    });
  });

  it("uses explicit linkedCardId over any epic-name overlap", () => {
    const ambiguousRows: TraceRow[] = [
      {
        id: "t3",
        requirement: "REQ-003",
        epic: "Capture",
        story: "Sprint dashboard",
        linkedCardId: "k2",
        commit: null,
        testCase: null,
        status: "missing",
        expanded: false,
      },
    ];

    expect(deriveTraceRows(ambiguousRows, cards)[0]).toEqual({
      ...ambiguousRows[0],
      commit: null,
      testCase: "TC-K2 Flow validation",
      status: "partial",
    });
  });

  it("does not derive trace fields when linkedCardId is missing", () => {
    const unlinkedRows: TraceRow[] = [
      {
        id: "t4",
        requirement: "REQ-004",
        epic: "Capture",
        story: "Capture form",
        commit: null,
        testCase: null,
        status: "missing",
        expanded: false,
      },
    ];

    expect(deriveTraceRows(unlinkedRows, cards)[0]).toEqual({
      ...unlinkedRows[0],
      commit: null,
      testCase: null,
      status: "missing",
    });
  });

  it("backfills missing linkedCardId when the row has a unique epic match", () => {
    const unlinkedRows: TraceRow[] = [
      {
        id: "t5",
        requirement: "REQ-005",
        epic: "Capture",
        story: "Capture form",
        commit: null,
        testCase: null,
        status: "missing",
        expanded: false,
      },
    ];

    expect(backfillTraceRowLinks(unlinkedRows, cards)[0]?.linkedCardId).toBe("k1");
  });

  it("does not backfill when matching is ambiguous", () => {
    const extraCards: KanbanCard[] = [
      ...cards,
      {
        id: "k3",
        title: "Capture fallback",
        epic: "Capture",
        priority: "low",
        estimate: 1,
        assignee: "DS",
        column: "todo",
        acceptance: [],
      },
    ];

    const unlinkedRows: TraceRow[] = [
      {
        id: "t6",
        requirement: "REQ-006",
        epic: "Capture",
        story: "Capture",
        commit: null,
        testCase: null,
        status: "missing",
        expanded: false,
      },
    ];

    expect(backfillTraceRowLinks(unlinkedRows, extraCards)[0]?.linkedCardId).toBeUndefined();
  });

  it("updates a trace row by id", () => {
    const updated = updateTraceRowById(rows, "t1", (row) => ({ ...row, testCase: "TC-123" }));

    expect(updated[0]?.testCase).toBe("TC-123");
    expect(updated[1]).toEqual(rows[1]);
  });
});