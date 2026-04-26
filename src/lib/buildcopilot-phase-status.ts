import type { ReviewDecision } from "@/lib/buildcopilot-types";

export type BuildCopilotPhaseStatus = "done" | "live" | "planned";

export type BuildCopilotPhaseStatusEntry = {
  id: string;
  status: BuildCopilotPhaseStatus;
  detail: string;
};

export type DeriveBuildCopilotPhaseStatusInput = {
  hasStructuredIdea: boolean;
  hasStrategy: boolean;
  hasRequirements: boolean;
  hasSuccessfulIntegration: boolean;
  hasSyncConfigured: boolean;
  reviewDecision?: ReviewDecision;
  deliveryCardCount: number;
  activeDeliveryCount: number;
  verifiedRowCount: number;
  totalRowCount: number;
  actionLogCount: number;
};

export function deriveBuildCopilotPhaseStatuses(
  input: DeriveBuildCopilotPhaseStatusInput,
): Map<string, BuildCopilotPhaseStatusEntry> {
  const statuses = new Map<string, BuildCopilotPhaseStatusEntry>();

  const p1Done = input.hasRequirements || input.deliveryCardCount > 0;
  const p1Live = input.hasStructuredIdea || input.hasStrategy;

  statuses.set("P1", {
    id: "P1",
    status: p1Done ? "done" : p1Live ? "live" : "planned",
    detail: p1Done
      ? "Capture, strategy, draft, and breakdown artifacts exist."
      : p1Live
        ? "Core idea-to-plan loop is active but not yet complete."
        : "Start by capturing ideas and generating initial product structure.",
  });

  const p2Done = input.hasSuccessfulIntegration;
  const p2Live = input.hasRequirements || input.hasSyncConfigured || input.activeDeliveryCount > 0;

  statuses.set("P2", {
    id: "P2",
    status: p2Done ? "done" : p2Live ? "live" : "planned",
    detail: p2Done
      ? "Backlog sync has already succeeded into delivery tooling."
      : p2Live
        ? input.activeDeliveryCount > 0
          ? `${input.activeDeliveryCount}/${input.deliveryCardCount || 0} build cards are moving through delivery.`
          : "Delivery-system work is active: acceptance criteria, sprint flow, or sync setup is underway."
        : "Unlock after Phase 1 delivers stable requirements and backlog artifacts.",
  });

  const p3Done = input.totalRowCount > 0 && input.verifiedRowCount === input.totalRowCount;
  const p3Live = p3Done || input.verifiedRowCount > 0 || (input.reviewDecision === "approved" && input.hasSuccessfulIntegration);

  statuses.set("P3", {
    id: "P3",
    status: p3Done ? "done" : p3Live ? "live" : "planned",
    detail: p3Done
      ? `${input.verifiedRowCount}/${input.totalRowCount} trace rows are fully verified.`
      : p3Live
        ? input.verifiedRowCount > 0
          ? `${input.verifiedRowCount}/${input.totalRowCount} trace rows already carry verification evidence.`
          : "Core USP work is now justified: traceability, validation, and code linking."
        : "Keep Verify work queued until the delivery system is stable enough to validate.",
  });

  const p4Live = input.actionLogCount > 0;

  statuses.set("P4", {
    id: "P4",
    status: p4Live ? "live" : "planned",
    detail: p4Live
      ? `${input.actionLogCount} AI actions already exist in runtime activity.`
      : "Add module-specific AI only after the core loop and Verify are dependable.",
  });

  statuses.set("P5", {
    id: "P5",
    status: "planned",
    detail: "Enterprise controls come last, after differentiation and adoption are proven.",
  });

  return statuses;
}