import type { KanbanCard } from "@/lib/buildcopilot-types";

export type BuildStoryStatus = "success" | "pending" | "failed";

export type BuildStory = {
  id: string;
  title: string;
  tasks: string[];
  commits: string[];
  status: BuildStoryStatus;
  assignee: string;
  done: number;
  total: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function deriveBuildStory(card: KanbanCard): BuildStory {
  const tasks = card.acceptance.length > 0 ? card.acceptance : ["Define acceptance criteria"];
  const total = Math.max(card.estimate, tasks.length, 1);
  const heuristicDone = card.column === "done"
    ? total
    : card.column === "inprogress"
      ? Math.max(1, Math.ceil(total / 2))
      : 0;
  const done = clamp(card.build?.completedTaskCount ?? heuristicDone, 0, total);
  const commits = card.build?.commits && card.build.commits.length > 0
    ? card.build.commits
    : card.column === "done"
      ? [`feat: ${card.title.toLowerCase()} #${card.id}`]
      : [];
  const status: BuildStoryStatus = done >= total ? "success" : done > 0 ? "pending" : "failed";

  return {
    id: card.id,
    title: card.title,
    tasks,
    commits,
    status,
    assignee: card.assignee,
    done,
    total,
  };
}

export function deriveBuildStories(cards: KanbanCard[]): BuildStory[] {
  return cards.map(deriveBuildStory);
}