import { describe, expect, it } from "vitest";
import {
  addAcceptanceCriterion,
  createKanbanCard,
  removeAcceptanceCriterion,
  updateCardById,
} from "@/lib/buildcopilot-cards";
import type { KanbanCard } from "@/lib/buildcopilot-types";

const cards: KanbanCard[] = [
  {
    id: "k1",
    title: "Persist roadmap edits",
    epic: "Strategy",
    priority: "high",
    estimate: 5,
    assignee: "AK",
    column: "todo",
    acceptance: ["Changes survive reload", "History stays intact"],
  },
  {
    id: "k2",
    title: "Show execution insights",
    epic: "Insight",
    priority: "medium",
    estimate: 3,
    assignee: "DS",
    column: "inprogress",
    acceptance: [],
  },
];

describe("buildcopilot-cards helpers", () => {
  it("updates a single card by id", () => {
    const updated = updateCardById(cards, "k2", (card) => ({ ...card, column: "done" }));

    expect(updated[1]?.column).toBe("done");
    expect(updated[0]).toEqual(cards[0]);
  });

  it("creates a normalized backlog card", () => {
    expect(
      createKanbanCard({
        id: "k3",
        title: "  Add acceptance editor  ",
        epic: "  Breakdown  ",
        priority: "medium",
        estimate: 3,
        assignee: "",
      }),
    ).toEqual({
      id: "k3",
      title: "Add acceptance editor",
      epic: "Breakdown",
      priority: "medium",
      estimate: 3,
      assignee: "—",
      column: "todo",
      acceptance: [],
      build: {
        commits: [],
        completedTaskCount: 0,
      },
    });
  });

  it("adds a trimmed acceptance criterion", () => {
    const updated = addAcceptanceCriterion(cards, "k2", "  Acceptance is editable  ");

    expect(updated[1]?.acceptance).toEqual(["Acceptance is editable"]);
  });

  it("ignores blank acceptance criteria", () => {
    expect(addAcceptanceCriterion(cards, "k2", "   ")).toEqual(cards);
  });

  it("removes an acceptance criterion by index", () => {
    const updated = removeAcceptanceCriterion(cards, "k1", 0);

    expect(updated[0]?.acceptance).toEqual(["History stays intact"]);
  });
});