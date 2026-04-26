import { NextRequest, NextResponse } from "next/server";
import {
  ReplayScheduledSyncRequest,
  ReplayScheduledSyncResponse,
} from "@/lib/buildcopilot-types";
import {
  reactivateDeadLetteredScheduledSyncJob,
  recordScheduledSyncRun,
} from "@/lib/idea-repository";
import { runIntegrationPush } from "@/lib/integration-orchestrator";

type Params = {
  params: Promise<{ ideaId: string; jobId: string }>;
};

export async function POST(request: NextRequest, context: Params) {
  try {
    const schedulerSecret = process.env.BUILDCOPILOT_SCHEDULER_SECRET;
    if (schedulerSecret) {
      const headerSecret = request.headers.get("x-buildcopilot-scheduler-secret");
      if (headerSecret !== schedulerSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { ideaId, jobId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as ReplayScheduledSyncRequest;
    const replayedBy = body.replayedBy?.trim() || "operator";

    const reactivated = await reactivateDeadLetteredScheduledSyncJob(ideaId, jobId, replayedBy);
    if (reactivated === "idea-not-found") {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    if (reactivated === "job-not-found") {
      return NextResponse.json({ error: "Scheduled sync job not found" }, { status: 404 });
    }

    if (reactivated === "not-dead-lettered") {
      return NextResponse.json(
        { error: "Scheduled sync job is not dead-lettered" },
        { status: 409 },
      );
    }

    const runNow = body.runNow ?? true;
    if (!runNow) {
      const response: ReplayScheduledSyncResponse = {
        ideaId,
        jobId,
        reactivated: true,
        runExecuted: false,
        job: reactivated,
      };

      return NextResponse.json(response, { status: 200 });
    }

    const pushResult = await runIntegrationPush({
      ideaId,
      target: reactivated.target,
      dryRun: body.dryRunOverride ?? reactivated.dryRun,
      actorRole: "System",
    });

    if (!pushResult) {
      return NextResponse.json(
        { error: "Idea not found during replay execution." },
        { status: 404 },
      );
    }

    const updatedJob = await recordScheduledSyncRun(ideaId, {
      jobId,
      ok: pushResult.ok,
      message: pushResult.message,
      attemptId: pushResult.attemptId,
      deadLetterAfterFailures: readDeadLetterThreshold(),
    });

    if (!updatedJob) {
      return NextResponse.json(
        { error: "Unable to update scheduled sync replay state." },
        { status: 500 },
      );
    }

    const response: ReplayScheduledSyncResponse = {
      ideaId,
      jobId,
      reactivated: true,
      runExecuted: true,
      job: updatedJob,
      runResult: {
        ok: pushResult.ok,
        message: pushResult.message,
        attemptId: pushResult.attemptId,
        deadLettered: Boolean(updatedJob.deadLetteredAt),
        deadLetterReason: updatedJob.deadLetterReason,
        consecutiveFailures: updatedJob.consecutiveFailures,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to replay dead-lettered schedule right now." },
      { status: 500 },
    );
  }
}

function readDeadLetterThreshold(): number {
  const raw = process.env.BUILDCOPILOT_SCHEDULER_DEAD_LETTER_FAILURES;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return 3;
  }

  return Math.min(Math.max(Math.floor(parsed), 1), 20);
}
