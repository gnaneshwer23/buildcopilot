import { describe, expect, it } from "vitest";
import { deriveBuildCopilotPhaseStatuses } from "@/lib/buildcopilot-phase-status";

function baseInput() {
  return {
    hasStructuredIdea: false,
    hasStrategy: false,
    hasRequirements: false,
    hasSuccessfulIntegration: false,
    hasSyncConfigured: false,
    reviewDecision: undefined,
    deliveryCardCount: 0,
    activeDeliveryCount: 0,
    verifiedRowCount: 0,
    totalRowCount: 0,
    actionLogCount: 0,
  } as const;
}

describe("deriveBuildCopilotPhaseStatuses", () => {
  it("returns all phases planned for a cold start", () => {
    const statuses = deriveBuildCopilotPhaseStatuses(baseInput());

    expect(statuses.get("P1")?.status).toBe("planned");
    expect(statuses.get("P2")?.status).toBe("planned");
    expect(statuses.get("P3")?.status).toBe("planned");
    expect(statuses.get("P4")?.status).toBe("planned");
    expect(statuses.get("P5")?.status).toBe("planned");
  });

  it("marks foundation live when structuring has started", () => {
    const statuses = deriveBuildCopilotPhaseStatuses({
      ...baseInput(),
      hasStructuredIdea: true,
    });

    expect(statuses.get("P1")?.status).toBe("live");
  });

  it("marks foundation done when requirements exist", () => {
    const statuses = deriveBuildCopilotPhaseStatuses({
      ...baseInput(),
      hasStructuredIdea: true,
      hasStrategy: true,
      hasRequirements: true,
    });

    expect(statuses.get("P1")?.status).toBe("done");
    expect(statuses.get("P2")?.status).toBe("live");
  });

  it("marks delivery system done after a successful integration", () => {
    const statuses = deriveBuildCopilotPhaseStatuses({
      ...baseInput(),
      hasRequirements: true,
      hasSuccessfulIntegration: true,
    });

    expect(statuses.get("P2")?.status).toBe("done");
  });

  it("marks core USP live when verified rows exist", () => {
    const statuses = deriveBuildCopilotPhaseStatuses({
      ...baseInput(),
      deliveryCardCount: 6,
      activeDeliveryCount: 3,
      verifiedRowCount: 2,
      totalRowCount: 5,
    });

    expect(statuses.get("P3")?.status).toBe("live");
  });

  it("marks core USP done when all rows are verified", () => {
    const statuses = deriveBuildCopilotPhaseStatuses({
      ...baseInput(),
      verifiedRowCount: 5,
      totalRowCount: 5,
    });

    expect(statuses.get("P3")?.status).toBe("done");
  });

  it("marks AI intelligence live when action logs exist", () => {
    const statuses = deriveBuildCopilotPhaseStatuses({
      ...baseInput(),
      actionLogCount: 4,
    });

    expect(statuses.get("P4")?.status).toBe("live");
  });
});