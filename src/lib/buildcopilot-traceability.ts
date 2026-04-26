import type { KanbanCard, TraceRow } from "@/lib/buildcopilot-types";

export function updateTraceRowById(
  rows: TraceRow[],
  rowId: string,
  updater: (row: TraceRow) => TraceRow,
): TraceRow[] {
  return rows.map((row) => (row.id === rowId ? updater(row) : row));
}

function inferLinkedCardId(row: TraceRow, cards: KanbanCard[]): string | null {
  const epicMatches = cards.filter((card) => row.epic.toLowerCase().includes(card.epic.toLowerCase()));
  if (epicMatches.length === 1) {
    return epicMatches[0]?.id ?? null;
  }

  const storyMatches = cards.filter((card) =>
    card.title.toLowerCase().includes(row.story.toLowerCase())
    || row.story.toLowerCase().includes(card.title.toLowerCase()),
  );
  if (storyMatches.length === 1) {
    return storyMatches[0]?.id ?? null;
  }

  return null;
}

export function backfillTraceRowLinks(rows: TraceRow[], cards: KanbanCard[]): TraceRow[] {
  return rows.map((row) => {
    if (row.linkedCardId) {
      return row;
    }

    const inferredCardId = inferLinkedCardId(row, cards);
    if (!inferredCardId) {
      return row;
    }

    return {
      ...row,
      linkedCardId: inferredCardId,
    };
  });
}

export function deriveTraceRows(rows: TraceRow[], cards: KanbanCard[]): TraceRow[] {
  return rows.map((row) => {
    const linkedCard = row.linkedCardId
      ? cards.find((card) => card.id === row.linkedCardId)
      : undefined;
    const derivedCommit = linkedCard?.build?.commits?.[0]
      ?? (linkedCard && linkedCard.column === "done"
        ? `feat: ${linkedCard.title.toLowerCase()} #${linkedCard.id}`
        : null);
    const derivedTestCase = linkedCard && linkedCard.column !== "todo"
      ? `TC-${linkedCard.id.toUpperCase()} Flow validation`
      : null;

    const commit = row.commit ?? derivedCommit;
    const testCase = row.testCase ?? derivedTestCase;
    const status: TraceRow["status"] = commit && testCase ? "complete" : commit || testCase ? "partial" : "missing";

    return {
      ...row,
      commit,
      testCase,
      status,
    };
  });
}