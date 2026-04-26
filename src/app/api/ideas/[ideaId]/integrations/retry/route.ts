import { NextRequest, NextResponse } from "next/server";
import {
  IntegrationRetryRequest,
  IntegrationTarget,
} from "@/lib/buildcopilot-types";
import {
  getIdeaById,
  listIntegrationAttempts,
} from "@/lib/idea-repository";
import { runIntegrationPush } from "@/lib/integration-orchestrator";

type Params = {
  params: Promise<{ ideaId: string }>;
};

export async function POST(request: NextRequest, context: Params) {
  try {
    const { ideaId } = await context.params;
    const body = (await request.json()) as IntegrationRetryRequest;

    if (!body.target) {
      return NextResponse.json({ error: "target is required" }, { status: 400 });
    }

    const target = body.target as IntegrationTarget;
    const idea = await getIdeaById(ideaId);
    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const attempts = (await listIntegrationAttempts(ideaId)) ?? [];
    const latestForTarget = attempts.find((item) => item.target === target);
    if (!latestForTarget) {
      return NextResponse.json(
        { error: `No prior ${target} attempt exists to retry.` },
        { status: 404 },
      );
    }

    const result = await runIntegrationPush({
      ideaId,
      target,
      dryRun: body.dryRun ?? false,
      previousAttemptId: latestForTarget.attemptId,
      actorRole: body.actorRole,
    });

    if (!result) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const status = result.policyBlocked ? 403 : result.ok ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch {
    return NextResponse.json(
      { error: "Unable to retry integration right now." },
      { status: 500 },
    );
  }
}
