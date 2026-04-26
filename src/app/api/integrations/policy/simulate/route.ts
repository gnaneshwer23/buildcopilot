import { NextRequest, NextResponse } from "next/server";
import {
  IntegrationActorRole,
  IntegrationTarget,
  PolicySimulationRequest,
} from "@/lib/buildcopilot-types";
import {
  getCurrentIntegrationEnvironment,
  POLICY_ACTOR_ROLES,
  POLICY_TARGETS,
  simulateIntegrationPolicy,
} from "@/lib/integration-policy";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as PolicySimulationRequest;
    const environment =
      body.environment?.trim().toLowerCase() || getCurrentIntegrationEnvironment();
    const actorRoles =
      (body.actorRoles ?? []).filter((role): role is IntegrationActorRole =>
        POLICY_ACTOR_ROLES.includes(role),
      ) || [];
    const targets =
      (body.targets ?? []).filter((target): target is IntegrationTarget =>
        POLICY_TARGETS.includes(target),
      ) || [];
    const response = simulateIntegrationPolicy({
      environment,
      actorRoles,
      targets,
    });

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to simulate policy right now." },
      { status: 500 },
    );
  }
}
