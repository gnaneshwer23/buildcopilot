import { NextRequest, NextResponse } from "next/server";
import { IntegrationPushRequest } from "@/lib/buildcopilot-types";
import { runIntegrationPush } from "@/lib/integration-orchestrator";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as IntegrationPushRequest;

    if (!body.ideaId) {
      return NextResponse.json({ error: "ideaId is required" }, { status: 400 });
    }

    const result = await runIntegrationPush({
      ideaId: body.ideaId,
      target: "jira",
      dryRun: body.dryRun ?? false,
      actorRole: body.actorRole,
    });
    if (!result) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const status = result.policyBlocked ? 403 : result.ok ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch {
    return NextResponse.json(
      { error: "Unable to push to Jira right now." },
      { status: 500 },
    );
  }
}
