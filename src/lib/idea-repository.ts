import { randomUUID } from "node:crypto";
import {
  ArtifactFieldChange,
  ArtifactVersion,
  ApproveIdeaRequest,
  BacklogPack,
  IntegrationAttempt,
  IntegrationTarget,
  IdeaHistoryResponse,
  IdeaListResponse,
  IdeaRecord,
  IdeaReview,
  IdeaStructuringResponse,
  ProductStrategy,
  RequirementsPack,
  ScheduledSyncJob,
} from "@/lib/buildcopilot-types";
import { ensureStore, saveStore } from "@/lib/persistence";

export async function saveStructuredIdea(
  payload: IdeaStructuringResponse,
  rawIdea: string,
  clarifications: string[],
  userId?: string,
): Promise<IdeaRecord> {
  const store = await ensureStore();

  const record: IdeaRecord = {
    ideaId: payload.ideaId,
    ...(userId ? { userId } : {}),
    rawIdea,
    clarifications,
    generatedAt: payload.generatedAt,
    stepStatus: payload.stepStatus,
    analysis: payload.analysis,
    status: "structured",
  };

  store.items.unshift(record);
  await saveStore(store);
  return record;
}

export async function listIdeas(userId?: string): Promise<IdeaListResponse> {
  const store = await ensureStore();
  const items = userId
    ? store.items.filter((item) => !item.userId || item.userId === userId)
    : store.items;
  return { items };
}

export async function getIdeaHistory(ideaId: string): Promise<IdeaHistoryResponse | null> {
  const store = await ensureStore();
  const idea = store.items.find((item) => item.ideaId === ideaId);

  if (!idea) {
    return null;
  }

  return {
    ideaId,
    strategyVersions: (idea.strategyVersions ?? []).map((version) => ({
      ...version,
      fieldChanges: version.fieldChanges ?? [],
    })),
    requirementsVersions: (idea.requirementsVersions ?? []).map((version) => ({
      ...version,
      fieldChanges: version.fieldChanges ?? [],
    })),
    latestReview: idea.latestReview,
  };
}

export async function getIdeaById(ideaId: string): Promise<IdeaRecord | null> {
  const store = await ensureStore();
  return store.items.find((item) => item.ideaId === ideaId) ?? null;
}

export async function deleteIdea(ideaId: string): Promise<boolean> {
  const store = await ensureStore();
  const before = store.items.length;
  store.items = store.items.filter((item) => item.ideaId !== ideaId);
  if (store.items.length === before) return false;
  await saveStore(store);
  return true;
}

export async function listIntegrationAttempts(
  ideaId: string,
): Promise<IntegrationAttempt[] | null> {
  const idea = await getIdeaById(ideaId);
  if (!idea) {
    return null;
  }

  return idea.integrationAttempts ?? [];
}

export async function listScheduledSyncJobs(
  ideaId: string,
): Promise<ScheduledSyncJob[] | null> {
  const idea = await getIdeaById(ideaId);
  if (!idea) {
    return null;
  }

  return idea.scheduledSyncJobs ?? [];
}

type UpsertScheduledSyncJobInput = {
  target: IntegrationTarget;
  intervalMinutes: number;
  dryRun: boolean;
  enabled: boolean;
};

export async function upsertScheduledSyncJob(
  ideaId: string,
  input: UpsertScheduledSyncJobInput,
): Promise<ScheduledSyncJob | null> {
  const store = await ensureStore();
  const index = store.items.findIndex((item) => item.ideaId === ideaId);
  if (index === -1) {
    return null;
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const nextRun = new Date(now.getTime() + input.intervalMinutes * 60_000).toISOString();
  const existing = store.items[index];
  const jobs = existing.scheduledSyncJobs ?? [];
  const jobIndex = jobs.findIndex((job) => job.target === input.target);

  const nextJob: ScheduledSyncJob =
    jobIndex === -1
      ? {
          jobId: randomUUID(),
          target: input.target,
          intervalMinutes: input.intervalMinutes,
          dryRun: input.dryRun,
          enabled: input.enabled,
          createdAt: nowIso,
          updatedAt: nowIso,
          nextRunAt: nextRun,
          consecutiveFailures: 0,
        }
      : {
          ...jobs[jobIndex],
          intervalMinutes: input.intervalMinutes,
          dryRun: input.dryRun,
          enabled: input.enabled,
          updatedAt: nowIso,
          nextRunAt: nextRun,
          consecutiveFailures: input.enabled
            ? 0
            : (jobs[jobIndex].consecutiveFailures ?? 0),
          deadLetteredAt: input.enabled ? undefined : jobs[jobIndex].deadLetteredAt,
          deadLetterReason: input.enabled ? undefined : jobs[jobIndex].deadLetterReason,
        };

  const nextJobs =
    jobIndex === -1
      ? [nextJob, ...jobs]
      : jobs.map((job, idx) => (idx === jobIndex ? nextJob : job));

  const updated: IdeaRecord = {
    ...existing,
    scheduledSyncJobs: nextJobs,
  };

  store.items[index] = updated;
  await saveStore(store);
  return nextJob;
}

export type DueScheduledSync = {
  ideaId: string;
  job: ScheduledSyncJob;
};

export async function listDueScheduledSyncs(
  nowIso: string,
  maxJobs = 20,
): Promise<DueScheduledSync[]> {
  const store = await ensureStore();
  const now = new Date(nowIso).getTime();
  const due: DueScheduledSync[] = [];

  for (const item of store.items) {
    const jobs = item.scheduledSyncJobs ?? [];
    for (const job of jobs) {
      if (!job.enabled) {
        continue;
      }

      const runAt = new Date(job.nextRunAt).getTime();
      if (runAt <= now) {
        due.push({
          ideaId: item.ideaId,
          job,
        });
      }

      if (due.length >= maxJobs) {
        return due;
      }
    }
  }

  return due;
}

type RecordScheduledSyncRunInput = {
  jobId: string;
  ok: boolean;
  message: string;
  attemptId?: string;
  deadLetterAfterFailures: number;
};

export async function recordScheduledSyncRun(
  ideaId: string,
  input: RecordScheduledSyncRunInput,
): Promise<ScheduledSyncJob | null> {
  const store = await ensureStore();
  const index = store.items.findIndex((item) => item.ideaId === ideaId);
  if (index === -1) {
    return null;
  }

  const existing = store.items[index];
  const jobs = existing.scheduledSyncJobs ?? [];
  const jobIndex = jobs.findIndex((job) => job.jobId === input.jobId);
  if (jobIndex === -1) {
    return null;
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const currentJob = jobs[jobIndex];
  const previousFailures = currentJob.consecutiveFailures ?? 0;
  const consecutiveFailures = input.ok ? 0 : previousFailures + 1;
  const shouldDeadLetter =
    !input.ok &&
    input.deadLetterAfterFailures > 0 &&
    consecutiveFailures >= input.deadLetterAfterFailures;
  const deadLetterReason = shouldDeadLetter
    ? `Exceeded ${input.deadLetterAfterFailures} consecutive scheduler failures.`
    : undefined;
  const nextRunAt = new Date(
    now.getTime() + currentJob.intervalMinutes * 60_000,
  ).toISOString();
  const nextJob: ScheduledSyncJob = {
    ...currentJob,
    updatedAt: nowIso,
    enabled: shouldDeadLetter ? false : currentJob.enabled,
    lastRunAt: nowIso,
    lastStatus: input.ok ? "ok" : "failed",
    lastMessage: shouldDeadLetter
      ? `${input.message} [dead-lettered]`
      : input.message,
    lastAttemptId: input.attemptId,
    consecutiveFailures,
    deadLetteredAt: shouldDeadLetter
      ? nowIso
      : input.ok
        ? undefined
        : currentJob.deadLetteredAt,
    deadLetterReason: shouldDeadLetter
      ? deadLetterReason
      : input.ok
        ? undefined
        : currentJob.deadLetterReason,
    nextRunAt,
  };

  // If the most recent audit log entry is a pending replay (runExecuted=false), patch it
  const existingLog = currentJob.replayAuditLog ?? [];
  if (existingLog.length > 0) {
    const lastEntry = existingLog[existingLog.length - 1];
    if (!lastEntry.runExecuted) {
      nextJob.replayAuditLog = [
        ...existingLog.slice(0, -1),
        {
          ...lastEntry,
          runExecuted: true,
          resultOk: input.ok,
          resultMessage: input.message,
        },
      ];
    }
  }

  const nextJobs = jobs.map((job, idx) => (idx === jobIndex ? nextJob : job));
  const updated: IdeaRecord = {
    ...existing,
    scheduledSyncJobs: nextJobs,
  };

  store.items[index] = updated;
  await saveStore(store);
  return nextJob;
}

export async function reactivateDeadLetteredScheduledSyncJob(
  ideaId: string,
  jobId: string,
  replayedBy = "operator",
): Promise<ScheduledSyncJob | "idea-not-found" | "job-not-found" | "not-dead-lettered"> {
  const store = await ensureStore();
  const index = store.items.findIndex((item) => item.ideaId === ideaId);
  if (index === -1) {
    return "idea-not-found";
  }

  const existing = store.items[index];
  const jobs = existing.scheduledSyncJobs ?? [];
  const jobIndex = jobs.findIndex((job) => job.jobId === jobId);
  if (jobIndex === -1) {
    return "job-not-found";
  }

  const currentJob = jobs[jobIndex];
  if (!currentJob.deadLetteredAt) {
    return "not-dead-lettered";
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const nextRunAt = new Date(
    now.getTime() + currentJob.intervalMinutes * 60_000,
  ).toISOString();

  const reactivatedJob: ScheduledSyncJob = {
    ...currentJob,
    enabled: true,
    updatedAt: nowIso,
    consecutiveFailures: 0,
    deadLetteredAt: undefined,
    deadLetterReason: undefined,
    nextRunAt,
    replayAuditLog: [
      ...(currentJob.replayAuditLog ?? []),
      {
        replayedAt: nowIso,
        replayedBy,
        runExecuted: false,
        resultOk: undefined,
        resultMessage: undefined,
      },
    ],
  };

  const nextJobs = jobs.map((job, idx) => (idx === jobIndex ? reactivatedJob : job));
  const updated: IdeaRecord = {
    ...existing,
    scheduledSyncJobs: nextJobs,
  };

  store.items[index] = updated;
  await saveStore(store);
  return reactivatedJob;
}

type IntegrationAttemptInput = {
  target: IntegrationTarget;
  dryRun: boolean;
  ok: boolean;
  message: string;
  externalId?: string;
  url?: string;
  retryCount: number;
  previousAttemptId?: string;
};

export async function appendIntegrationAttempt(
  ideaId: string,
  input: IntegrationAttemptInput,
): Promise<IntegrationAttempt | null> {
  const store = await ensureStore();
  const index = store.items.findIndex((item) => item.ideaId === ideaId);
  if (index === -1) {
    return null;
  }

  const existing = store.items[index];
  const attempt: IntegrationAttempt = {
    attemptId: randomUUID(),
    target: input.target,
    triggeredAt: new Date().toISOString(),
    dryRun: input.dryRun,
    ok: input.ok,
    message: input.message,
    externalId: input.externalId,
    url: input.url,
    retryCount: input.retryCount,
    previousAttemptId: input.previousAttemptId,
  };

  const updated: IdeaRecord = {
    ...existing,
    integrationAttempts: [attempt, ...(existing.integrationAttempts ?? [])].slice(0, 50),
  };

  store.items[index] = updated;
  await saveStore(store);
  return attempt;
}

export async function reviewIdea(
  ideaId: string,
  request: ApproveIdeaRequest,
): Promise<IdeaRecord | null> {
  const store = await ensureStore();
  const index = store.items.findIndex((item) => item.ideaId === ideaId);

  if (index === -1) {
    return null;
  }

  const review: IdeaReview = {
    ideaId,
    role: request.role,
    decision: request.decision,
    notes: request.notes?.trim() ?? "",
    reviewedAt: new Date().toISOString(),
  };

  const statusMap: Record<ApproveIdeaRequest["decision"], IdeaRecord["status"]> = {
    approved: "approved",
    changes_requested: "changes_requested",
    rejected: "rejected",
  };

  const existing = store.items[index];
  const updated: IdeaRecord = {
    ...existing,
    status: statusMap[request.decision],
    latestReview: review,
  };

  store.items[index] = updated;
  await saveStore(store);
  return updated;
}

export async function updateIdeaStrategy(
  ideaId: string,
  updater: (current: ProductStrategy) => ProductStrategy,
): Promise<IdeaRecord | null> {
  const store = await ensureStore();
  const index = store.items.findIndex((item) => item.ideaId === ideaId);

  if (index === -1) {
    return null;
  }

  const existing = store.items[index];
  if (!existing.strategy) {
    return null;
  }

  const nextStrategy = updater(existing.strategy);
  const strategyVersions = existing.strategyVersions ?? [];
  const newVersion = buildVersion(strategyVersions, nextStrategy, existing.strategy);

  const updated: IdeaRecord = {
    ...existing,
    strategy: nextStrategy,
    strategyVersions: [...strategyVersions, newVersion],
    stepStatus: { ...existing.stepStatus, S04: "done" },
  };

  store.items[index] = updated;
  await saveStore(store);
  return updated;
}

export async function saveIdeaStrategy(
  ideaId: string,
  strategy: ProductStrategy,
): Promise<IdeaRecord | null> {
  const store = await ensureStore();
  const index = store.items.findIndex((item) => item.ideaId === ideaId);

  if (index === -1) {
    return null;
  }

  const existing = store.items[index];
  const strategyVersions = existing.strategyVersions ?? [];
  const newVersion = buildVersion(strategyVersions, strategy, existing.strategy);
  const updated: IdeaRecord = {
    ...existing,
    strategy,
    strategyVersions: [...strategyVersions, newVersion],
    stepStatus: { ...existing.stepStatus, S04: "done" },
  };

  store.items[index] = updated;
  await saveStore(store);
  return updated;
}

export async function saveIdeaRequirements(
  ideaId: string,
  requirements: RequirementsPack,
): Promise<IdeaRecord | null> {
  const store = await ensureStore();
  const index = store.items.findIndex((item) => item.ideaId === ideaId);

  if (index === -1) {
    return null;
  }

  const existing = store.items[index];
  const requirementsVersions = existing.requirementsVersions ?? [];
  const newVersion = buildVersion(
    requirementsVersions,
    requirements,
    existing.requirements,
  );
  const updated: IdeaRecord = {
    ...existing,
    requirements,
    requirementsVersions: [...requirementsVersions, newVersion],
    stepStatus: { ...existing.stepStatus, S05: "done" },
  };

  store.items[index] = updated;
  await saveStore(store);
  return updated;
}

export async function saveIdeaBacklog(
  ideaId: string,
  backlog: BacklogPack,
): Promise<IdeaRecord | null> {
  const store = await ensureStore();
  const index = store.items.findIndex((item) => item.ideaId === ideaId);

  if (index === -1) {
    return null;
  }

  const existing = store.items[index];
  const backlogVersions = existing.backlogVersions ?? [];
  const newVersion = buildVersion(
    backlogVersions,
    backlog,
    existing.backlog,
  );
  const updated: IdeaRecord = {
    ...existing,
    backlog,
    backlogVersions: [...backlogVersions, newVersion],
  };

  store.items[index] = updated;
  await saveStore(store);
  return updated;
}

export async function updateIdeaRequirements(
  ideaId: string,
  updater: (current: RequirementsPack) => RequirementsPack,
): Promise<IdeaRecord | null> {
  const store = await ensureStore();
  const index = store.items.findIndex((item) => item.ideaId === ideaId);

  if (index === -1) {
    return null;
  }

  const existing = store.items[index];
  if (!existing.requirements) {
    return null;
  }

  const nextRequirements = updater(existing.requirements);
  const requirementsVersions = existing.requirementsVersions ?? [];
  const newVersion = buildVersion(
    requirementsVersions,
    nextRequirements,
    existing.requirements,
  );

  const updated: IdeaRecord = {
    ...existing,
    requirements: nextRequirements,
    requirementsVersions: [...requirementsVersions, newVersion],
    stepStatus: { ...existing.stepStatus, S05: "done" },
  };

  store.items[index] = updated;
  await saveStore(store);
  return updated;
}

export async function updateStoryStatus(
  ideaId: string,
  storyId: string,
  status: import("@/lib/buildcopilot-types").StoryStatus,
): Promise<IdeaRecord | null> {
  const store = await ensureStore();
  const index = store.items.findIndex((item) => item.ideaId === ideaId);
  if (index === -1) return null;

  const existing = store.items[index];
  if (!existing.backlog) return null;

  const epics = existing.backlog.epics.map((epic) => ({
    ...epic,
    stories: epic.stories.map((story) =>
      story.id === storyId ? { ...story, status } : story,
    ),
  }));

  const updated: IdeaRecord = {
    ...existing,
    backlog: { ...existing.backlog, epics },
  };

  store.items[index] = updated;
  await saveStore(store);
  return updated;
}

function buildVersion<TArtifact>(
  versions: ArtifactVersion<TArtifact>[],
  artifact: TArtifact,
  previous?: TArtifact,
): ArtifactVersion<TArtifact> {
  const version = versions.length + 1;
  const generatedAt = new Date().toISOString();

  if (!previous) {
    return {
      version,
      generatedAt,
      changeSummary: "Initial generated version",
      fieldChanges: [],
      artifact,
    };
  }

  const currentJson = JSON.stringify(artifact);
  const previousJson = JSON.stringify(previous);
  const fieldChanges =
    currentJson === previousJson ? [] : collectFieldChanges(previous, artifact);
  const changed =
    fieldChanges.length === 0
      ? "No material change"
      : summarizeDiffFromChanges(fieldChanges);

  return {
    version,
    generatedAt,
    changeSummary: changed,
    fieldChanges,
    artifact,
  };
}

function summarizeDiffFromChanges(changes: ArtifactFieldChange[]): string {
  if (changes.length === 0) {
    return "No material change";
  }

  const sample = changes.slice(0, 3).map((change) => change.path).join(", ");
  return `${changes.length} fields updated (${sample})`;
}

function collectFieldChanges<TArtifact>(
  previous: TArtifact,
  current: TArtifact,
): ArtifactFieldChange[] {
  const changes: ArtifactFieldChange[] = [];
  walkChanges(previous, current, "", changes);
  return changes.slice(0, 20);
}

function walkChanges(
  previous: unknown,
  current: unknown,
  basePath: string,
  changes: ArtifactFieldChange[],
) {
  if (changes.length > 30) {
    return;
  }

  if (isPrimitive(previous) || isPrimitive(current)) {
    if (JSON.stringify(previous) !== JSON.stringify(current)) {
      changes.push({
        path: basePath || "root",
        before: stringifyValue(previous),
        after: stringifyValue(current),
      });
    }
    return;
  }

  if (Array.isArray(previous) || Array.isArray(current)) {
    if (JSON.stringify(previous) !== JSON.stringify(current)) {
      changes.push({
        path: basePath || "root",
        before: stringifyValue(previous),
        after: stringifyValue(current),
      });
    }
    return;
  }

  const prevObj = (previous ?? {}) as Record<string, unknown>;
  const currObj = (current ?? {}) as Record<string, unknown>;
  const keys = new Set([...Object.keys(prevObj), ...Object.keys(currObj)]);

  for (const key of keys) {
    const path = basePath ? `${basePath}.${key}` : key;
    walkChanges(prevObj[key], currObj[key], path, changes);
  }
}

function isPrimitive(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function stringifyValue(value: unknown): string {
  if (value === undefined) {
    return "undefined";
  }
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
}
