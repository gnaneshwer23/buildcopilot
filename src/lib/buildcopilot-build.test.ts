import { describe, expect, it } from "vitest";
import { deriveBuildStories } from "@/lib/buildcopilot-build";
import type { KanbanCard } from "@/lib/buildcopilot-types";

const cards: KanbanCard[] = [
  {
    id: "k1",
    title: "Persist roadmap edits",
    epic: "Strategy",
    priority: "high",
    estimate: 5,
    assignee: "AK",
    column: "inprogress",
    acceptance: ["Changes survive reload", "Edits are versioned"],
    build: {
      commits: ["feat: persist roadmap #k1"],
      completedTaskCount: 2,
    },
  },
  {
    id: "k2",
    title: "Show execution insights",
    epic: "Insight",
    priority: "medium",
    estimate: 3,
    assignee: "DS",
    column: "done",
    acceptance: [],
  },
];

describe("buildcopilot-build helpers", () => {
  it("derives build stories from persisted build metadata", () => {
    expect(deriveBuildStories(cards)[0]).toEqual({
      id: "k1",
      title: "Persist roadmap edits",
      tasks: ["Changes survive reload", "Edits are versioned"],
      commits: ["feat: persist roadmap #k1"],
      status: "pending",
      assignee: "AK",
      done: 2,
      total: 5,
    });
  });

  it("falls back to derived commits and placeholder tasks when build metadata is absent", () => {
    expect(deriveBuildStories(cards)[1]).toEqual({
      id: "k2",
      title: "Show execution insights",
      tasks: ["Define acceptance criteria"],
      commits: ["feat: show execution insights #k2"],
      status: "success",
      assignee: "DS",
      done: 3,
      total: 3,
    });
  });
});