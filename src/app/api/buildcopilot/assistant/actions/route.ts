import { NextRequest, NextResponse } from "next/server";
import type {
  AssistantActionRequest,
  AssistantActionResponse,
  BuildCopilotSnapshot,
  KanbanCard,
} from "@/lib/buildcopilot-types";

const SUPPORTED_ACTION_IDS = new Set(["s4", "s5", "s6"]);

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AssistantActionRequest;
    if (!body?.actionId || !body?.snapshot) {
      return NextResponse.json({ error: "Missing actionId or snapshot." }, { status: 400 });
    }

    if (!SUPPORTED_ACTION_IDS.has(body.actionId)) {
      console.warn("[buildcopilot/assistant/actions POST] Unsupported actionId:", body.actionId);
      return NextResponse.json(
        { error: "Unsupported actionId.", code: "invalid_action" },
        { status: 400 },
      );
    }

    console.info("[buildcopilot/assistant/actions POST] Executing action:", body.actionId);
    const response = runAction(body.actionId, body.snapshot);
    console.info("[buildcopilot/assistant/actions POST] Completed:", body.actionId, "-", response.message);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[buildcopilot/assistant/actions POST] Unhandled error:", error);
    return NextResponse.json({ error: "Unable to execute assistant action." }, { status: 500 });
  }
}

function runAction(actionId: string, snapshot: BuildCopilotSnapshot): AssistantActionResponse {
  if (actionId === "s4") {
    return generateStories(snapshot);
  }

  if (actionId === "s5") {
    return summarizeSprint(snapshot);
  }

  if (actionId === "s6") {
    return detectBlockers(snapshot);
  }

  throw new Error("Unsupported action.");
}

function generateStories(snapshot: BuildCopilotSnapshot): AssistantActionResponse {
  const featuresSection =
    snapshot.prdSections.find((section) => section.title.toLowerCase().includes("features"))
      ?.content ?? "";

  const rawLines = featuresSection
    .split("\n")
    .map((line) => line.replace(/^\s*\d+\.\s*/, "").trim())
    .filter(Boolean);

  const candidateTitles = rawLines.length > 0 ? rawLines : [
    "AI acceptance criteria reviewer",
    "Sprint blocker digest panel",
    "Release readiness checklist",
  ];

  const existingTitles = new Set(snapshot.cards.map((card) => card.title.toLowerCase()));
  const additions: KanbanCard[] = [];

  for (const title of candidateTitles) {
    if (existingTitles.has(title.toLowerCase())) {
      continue;
    }

    additions.push({
      id: `gen-${Math.random().toString(36).slice(2, 8)}`,
      title,
      epic: "Breakdown",
      priority: "medium",
      estimate: 3,
      assignee: "AI",
      column: "todo",
      acceptance: [
        "Story has clear scope",
        "Acceptance criteria are testable",
        "Traceability chain can be mapped",
      ],
    });

    if (additions.length >= 3) {
      break;
    }
  }

  if (additions.length === 0) {
    return {
      message: "No new stories generated. Existing backlog already covers the current feature set.",
      cards: snapshot.cards,
    };
  }

  const cards = [...snapshot.cards, ...additions];
  return {
    message: `Generated ${additions.length} new user stor${additions.length > 1 ? "ies" : "y"} from PRD features.`,
    cards,
  };
}

function summarizeSprint(snapshot: BuildCopilotSnapshot): AssistantActionResponse {
  const done = snapshot.cards.filter((card) => card.column === "done").length;
  const inProgress = snapshot.cards.filter((card) => card.column === "inprogress").length;
  const todo = snapshot.cards.filter((card) => card.column === "todo").length;
  const total = snapshot.cards.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const completeRows = snapshot.rows.filter((row) => row.status === "complete").length;
  const coverage = snapshot.rows.length > 0
    ? Math.round((completeRows / snapshot.rows.length) * 100)
    : 0;

  const summary = [
    `Sprint progress: ${done}/${total} stories done (${progress}%).`,
    `${inProgress} in progress, ${todo} pending.`,
    `Validation coverage is ${coverage}% across ${snapshot.rows.length} requirements.`,
  ].join(" ");

  return {
    message: "Sprint summary generated.",
    summary,
  };
}

function detectBlockers(snapshot: BuildCopilotSnapshot): AssistantActionResponse {
  const blockers: string[] = [];

  for (const row of snapshot.rows) {
    if (row.status === "missing") {
      blockers.push(`${row.requirement} is missing commit/test linkage.`);
    }
  }

  for (const card of snapshot.cards) {
    if (card.priority === "high" && card.column === "todo") {
      blockers.push(`High-priority story '${card.title}' is still in To Do.`);
    }

    if (!card.acceptance || card.acceptance.length === 0) {
      blockers.push(`Story '${card.title}' is missing acceptance criteria.`);
    }
  }

  if (blockers.length === 0) {
    blockers.push("No blocking issues detected in the current sprint.");
  }

  return {
    message: `Detected ${blockers.length} blocker signal${blockers.length > 1 ? "s" : ""}.`,
    blockers,
  };
}
