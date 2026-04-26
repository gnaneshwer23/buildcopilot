import {
  RunDueSyncRequest,
  RunDueSyncResponse,
} from "@/lib/buildcopilot-types";
import {
  listDueScheduledSyncs,
  recordScheduledSyncRun,
} from "@/lib/idea-repository";
import { runIntegrationPush } from "@/lib/integration-orchestrator";

export async function runDueScheduledSyncs(
  body: RunDueSyncRequest,
): Promise<RunDueSyncResponse> {
  const maxJobs = Math.min(Math.max(body.maxJobs ?? 20, 1), 100);
  const deadLetterAfterFailures = readDeadLetterThreshold();
  const due = await listDueScheduledSyncs(new Date().toISOString(), maxJobs);

  const results: RunDueSyncResponse["results"] = [];

  for (const item of due) {
    const result = await runIntegrationPush({
      ideaId: item.ideaId,
      target: item.job.target,
      dryRun: body.dryRunOverride ?? item.job.dryRun,
      actorRole: "System",
    });

    if (!result) {
      results.push({
        ideaId: item.ideaId,
        jobId: item.job.jobId,
        target: item.job.target,
        ok: false,
        message: "Idea not found during scheduled run.",
      });
      continue;
    }

    const updatedJob = await recordScheduledSyncRun(item.ideaId, {
      jobId: item.job.jobId,
      ok: result.ok,
      message: result.message,
      attemptId: result.attemptId,
      deadLetterAfterFailures,
    });

    results.push({
      ideaId: item.ideaId,
      jobId: item.job.jobId,
      target: item.job.target,
      ok: result.ok,
      message: result.message,
      attemptId: result.attemptId,
      consecutiveFailures: updatedJob?.consecutiveFailures,
      deadLettered: Boolean(updatedJob?.deadLetteredAt),
      deadLetterReason: updatedJob?.deadLetterReason,
    });
  }

  return {
    processed: due.length,
    triggered: results.filter((item) => item.ok).length,
    deadLettered: results.filter((item) => item.deadLettered).length,
    results,
  };
}

function readDeadLetterThreshold(): number {
  const raw = process.env.BUILDCOPILOT_SCHEDULER_DEAD_LETTER_FAILURES;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return 3;
  }

  return Math.min(Math.max(Math.floor(parsed), 1), 20);
}
