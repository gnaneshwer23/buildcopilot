import {
  IntegrationTarget,
  SchedulerObservabilityResponse,
} from "@/lib/buildcopilot-types";
import { ensureStore } from "@/lib/persistence";

const TARGETS: IntegrationTarget[] = ["jira", "confluence", "linear"];

export async function collectSchedulerObservability(): Promise<SchedulerObservabilityResponse> {
  const now = new Date();
  const nowMs = now.getTime();
  const dayAgoMs = nowMs - 24 * 60 * 60 * 1000;
  const store = await ensureStore();

  let totalJobs = 0;
  let enabledJobs = 0;
  let dueJobs = 0;
  let deadLetteredJobs = 0;
  let runsLast24h = 0;
  let failedRunsLast24h = 0;

  const jobStatusByTarget: SchedulerObservabilityResponse["jobStatusByTarget"] = {
    jira: { total: 0, enabled: 0, due: 0, deadLettered: 0 },
    confluence: { total: 0, enabled: 0, due: 0, deadLettered: 0 },
    linear: { total: 0, enabled: 0, due: 0, deadLettered: 0 },
  };

  const recentFailures: Array<{
    ideaId: string;
    target: IntegrationTarget;
    triggeredAt: string;
    message: string;
    retryCount: number;
  }> = [];

  const recentDeadLetters: SchedulerObservabilityResponse["recentDeadLetters"] = [];

  for (const idea of store.items) {
    const jobs = idea.scheduledSyncJobs ?? [];

    for (const job of jobs) {
      totalJobs += 1;
      jobStatusByTarget[job.target].total += 1;

      if (job.enabled) {
        enabledJobs += 1;
        jobStatusByTarget[job.target].enabled += 1;
      }

      if (job.enabled && new Date(job.nextRunAt).getTime() <= nowMs) {
        dueJobs += 1;
        jobStatusByTarget[job.target].due += 1;
      }

      if (job.deadLetteredAt) {
        deadLetteredJobs += 1;
        jobStatusByTarget[job.target].deadLettered += 1;
        recentDeadLetters.push({
          ideaId: idea.ideaId,
          target: job.target,
          deadLetteredAt: job.deadLetteredAt,
          reason: job.deadLetterReason ?? "Exceeded scheduler failure threshold.",
          consecutiveFailures: job.consecutiveFailures ?? 0,
        });
      }

      if (job.lastRunAt && new Date(job.lastRunAt).getTime() >= dayAgoMs) {
        runsLast24h += 1;
        if (job.lastStatus === "failed") {
          failedRunsLast24h += 1;
        }
      }
    }

    const failedAttempts = (idea.integrationAttempts ?? [])
      .filter((attempt) => !attempt.ok)
      .filter((attempt) => TARGETS.includes(attempt.target))
      .sort((a, b) => toMs(b.triggeredAt) - toMs(a.triggeredAt));

    for (const attempt of failedAttempts.slice(0, 5)) {
      recentFailures.push({
        ideaId: idea.ideaId,
        target: attempt.target,
        triggeredAt: attempt.triggeredAt,
        message: attempt.message,
        retryCount: attempt.retryCount,
      });
    }
  }

  recentFailures.sort((a, b) => toMs(b.triggeredAt) - toMs(a.triggeredAt));
  recentDeadLetters.sort((a, b) => toMs(b.deadLetteredAt) - toMs(a.deadLetteredAt));

  return {
    collectedAt: now.toISOString(),
    totalIdeas: store.items.length,
    totalJobs,
    enabledJobs,
    dueJobs,
    deadLetteredJobs,
    runsLast24h,
    failedRunsLast24h,
    jobStatusByTarget,
    recentFailures: recentFailures.slice(0, 12),
    recentDeadLetters: recentDeadLetters.slice(0, 12),
  };
}

function toMs(value: string): number {
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : 0;
}
