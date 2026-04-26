export type StructuringRequest = {
  rawIdea: string;
  clarifications?: string[];
};

export type StepId = "S01" | "S02" | "S03" | "S04" | "S05";
export type IntegrationTarget = "jira" | "confluence" | "linear";
export type IntegrationActorRole = ReviewRole | "System";

export type ArtifactVersion<TArtifact> = {
  version: number;
  generatedAt: string;
  changeSummary: string;
  fieldChanges: ArtifactFieldChange[];
  artifact: TArtifact;
};

export type ArtifactFieldChange = {
  path: string;
  before: string;
  after: string;
};

export type ReviewRole = "Product Manager" | "Business Analyst" | "Sponsor";
export type ReviewDecision = "approved" | "changes_requested" | "rejected";

export type StructuringAnalysis = {
  problemStatement: string;
  targetUsers: string[];
  goals: string[];
  usp: string;
  assumptions: string[];
  successMetrics: string[];
  personas: Array<{
    name: string;
    role: string;
    painPoint: string;
    goal: string;
  }>;
};

export type IdeaStructuringResponse = {
  ideaId: string;
  generatedAt: string;
  stepStatus: Record<"S01" | "S02" | "S03", "done">;
  clarificationQuestions: string[];
  analysis: StructuringAnalysis;
};

export type ProductStrategy = {
  ideaId: string;
  generatedAt: string;
  vision: string;
  marketPosition: string;
  businessModel: string;
  mvpScope: string[];
  nonGoals: string[];
  roadmapNowNextLater: {
    now: string[];
    next: string[];
    later: string[];
  };
  prioritization: Array<{
    item: string;
    method: "RICE" | "MoSCoW";
    rationale: string;
  }>;
  successMetrics: string[];
};

export type RequirementsPack = {
  ideaId: string;
  generatedAt: string;
  prd: {
    title: string;
    objectives: string[];
    personas: string[];
    features: string[];
    dependencies: string[];
    releasePlan: string[];
  };
  brd: {
    businessCase: string;
    stakeholders: string[];
    assumptions: string[];
    constraints: string[];
    benefits: string[];
  };
  frd: {
    functionalRequirements: Array<{ id: string; text: string; priority: "high" | "medium" | "low" }>;
    nonFunctionalRequirements: Array<{ id: string; category: string; text: string }>;
  };
};

export type StoryStatus = "todo" | "in_progress" | "done";

export type UserStory = {
  id: string;
  requirementId: string;
  title: string;
  asA: string;
  iWantTo: string;
  soThat: string;
  acceptanceCriteria: string[];
  status?: StoryStatus;
};

export type Epic = {
  id: string;
  title: string;
  description: string;
  stories: UserStory[];
};

export type BacklogPack = {
  ideaId: string;
  generatedAt: string;
  epics: Epic[];
};

export type IdeaRecord = {
  ideaId: string;
  userId?: string;
  rawIdea: string;
  clarifications: string[];
  generatedAt: string;
  stepStatus: Partial<Record<StepId, "done">>;
  analysis: StructuringAnalysis;
  status: "structured" | "approved" | "changes_requested" | "rejected";
  latestReview?: IdeaReview;
  strategy?: ProductStrategy;
  requirements?: RequirementsPack;
  backlog?: BacklogPack;
  strategyVersions?: ArtifactVersion<ProductStrategy>[];
  requirementsVersions?: ArtifactVersion<RequirementsPack>[];
  backlogVersions?: ArtifactVersion<BacklogPack>[];
  integrationAttempts?: IntegrationAttempt[];
  scheduledSyncJobs?: ScheduledSyncJob[];
};

export type ScheduledSyncReplayAuditEntry = {
  replayedAt: string;
  replayedBy: string;
  runExecuted: boolean;
  resultOk?: boolean;
  resultMessage?: string;
};

export type ScheduledSyncJob = {
  jobId: string;
  target: IntegrationTarget;
  intervalMinutes: number;
  dryRun: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  nextRunAt: string;
  lastRunAt?: string;
  lastStatus?: "ok" | "failed";
  lastMessage?: string;
  lastAttemptId?: string;
  consecutiveFailures?: number;
  deadLetteredAt?: string;
  deadLetterReason?: string;
  replayAuditLog?: ScheduledSyncReplayAuditEntry[];
};

export type IntegrationAttempt = {
  attemptId: string;
  target: IntegrationTarget;
  triggeredAt: string;
  dryRun: boolean;
  ok: boolean;
  message: string;
  externalId?: string;
  url?: string;
  retryCount: number;
  previousAttemptId?: string;
};

export type IdeaReview = {
  ideaId: string;
  role: ReviewRole;
  decision: ReviewDecision;
  notes: string;
  reviewedAt: string;
};

export type ApproveIdeaRequest = {
  role: ReviewRole;
  decision: ReviewDecision;
  notes?: string;
};

export type IdeaListResponse = {
  items: IdeaRecord[];
};

export type GenerateStrategyResponse = {
  ideaId: string;
  strategy: ProductStrategy;
};

export type GenerateRequirementsResponse = {
  ideaId: string;
  requirements: RequirementsPack;
};

export type UpdateStrategyRequest = {
  vision?: string;
  marketPosition?: string;
  businessModel?: string;
  mvpScope?: string[];
  nonGoals?: string[];
  successMetrics?: string[];
};

export type UpdateRequirementsRequest = {
  prdTitle?: string;
  businessCase?: string;
  topFunctionalRequirementText?: string;
};

export type IdeaHistoryResponse = {
  ideaId: string;
  strategyVersions: ArtifactVersion<ProductStrategy>[];
  requirementsVersions: ArtifactVersion<RequirementsPack>[];
  latestReview?: IdeaReview;
};

export type IntegrationPushRequest = {
  ideaId: string;
  dryRun?: boolean;
  actorRole?: IntegrationActorRole;
};

export type IntegrationPushResponse = {
  target: IntegrationTarget;
  ideaId: string;
  ok: boolean;
  dryRun: boolean;
  message: string;
  externalId?: string;
  url?: string;
  payloadPreview?: unknown;
  attemptId?: string;
  retryCount?: number;
  previousAttemptId?: string;
  policyBlocked?: boolean;
  policyContext?: {
    environment: string;
    actorRole: IntegrationActorRole;
  };
};

export type IntegrationRetryRequest = {
  target: IntegrationTarget;
  dryRun?: boolean;
  actorRole?: IntegrationActorRole;
};

export type IntegrationPolicyConfig = {
  environments?: Partial<Record<string, IntegrationTarget[]>>;
  roles?: Partial<Record<IntegrationActorRole, IntegrationTarget[]>>;
};

export type PolicySimulationRequest = {
  environment?: string;
  actorRoles?: IntegrationActorRole[];
  targets?: IntegrationTarget[];
};

export type PolicySimulationResponse = {
  environment: string;
  activePolicy: Required<IntegrationPolicyConfig>;
  results: Array<{
    actorRole: IntegrationActorRole;
    target: IntegrationTarget;
    allowed: boolean;
    reason?: string;
  }>;
};

export type UpsertScheduledSyncRequest = {
  target: IntegrationTarget;
  intervalMinutes: number;
  dryRun?: boolean;
  enabled?: boolean;
};

export type ReplayScheduledSyncRequest = {
  runNow?: boolean;
  dryRunOverride?: boolean;
  replayedBy?: string;
};

export type ReplayScheduledSyncResponse = {
  ideaId: string;
  jobId: string;
  reactivated: boolean;
  runExecuted: boolean;
  job: ScheduledSyncJob;
  runResult?: {
    ok: boolean;
    message: string;
    attemptId?: string;
    deadLettered?: boolean;
    deadLetterReason?: string;
    consecutiveFailures?: number;
  };
};

export type RunDueSyncRequest = {
  maxJobs?: number;
  dryRunOverride?: boolean;
};

export type RunDueSyncResponse = {
  processed: number;
  triggered: number;
  deadLettered: number;
  results: Array<{
    ideaId: string;
    jobId: string;
    target: IntegrationTarget;
    ok: boolean;
    message: string;
    attemptId?: string;
    consecutiveFailures?: number;
    deadLettered?: boolean;
    deadLetterReason?: string;
  }>;
};

export type SchedulerObservabilityResponse = {
  collectedAt: string;
  totalIdeas: number;
  totalJobs: number;
  enabledJobs: number;
  dueJobs: number;
  deadLetteredJobs: number;
  runsLast24h: number;
  failedRunsLast24h: number;
  jobStatusByTarget: Record<
    IntegrationTarget,
    { total: number; enabled: number; due: number; deadLettered: number }
  >;
  recentFailures: Array<{
    ideaId: string;
    target: IntegrationTarget;
    triggeredAt: string;
    message: string;
    retryCount: number;
  }>;
  recentDeadLetters: Array<{
    ideaId: string;
    target: IntegrationTarget;
    deadLetteredAt: string;
    reason: string;
    consecutiveFailures: number;
  }>;
};

export type WebhookReplayMetricsResponse = {
  collectedAt: string;
  backend: "file" | "supabase";
  totalEntries: number;
  activeEntries: number;
  expiredEntries: number;
  oldestActiveExpiresAt?: string;
  newestActiveExpiresAt?: string;
};

export type BulkPushRequest = {
  ideaIds: string[];
  targets: IntegrationTarget[];
  dryRun?: boolean;
  actorRole?: IntegrationActorRole;
};

export type BulkExecutionTelemetry = {
  startedAt: string;
  completedAt: string;
  durationMs: number;
  totalTasks: number;
  concurrencyLimit: number;
  queuedTasks: number;
  peakQueueDepth: number;
  errorBuckets: Record<string, number>;
};

export type BulkPushResponse = {
  total: number;
  successful: number;
  concurrencyLimit: number;
  telemetry: BulkExecutionTelemetry;
  idempotencyKey?: string;
  idempotencyHit?: boolean;
  results: Array<IntegrationPushResponse & { ideaId: string; target: IntegrationTarget }>;
};

export type BulkExportRequest = {
  ideaIds: string[];
  format: "markdown" | "json" | "docx";
};

export type BulkExportResponse = {
  total: number;
  available: number;
  concurrencyLimit: number;
  telemetry: BulkExecutionTelemetry;
  idempotencyKey?: string;
  idempotencyHit?: boolean;
  items: Array<{
    ideaId: string;
    format: "markdown" | "json" | "docx";
    filename: string;
    downloadUrl: string;
  }>;
};

export const initialStructuringRequest: StructuringRequest = {
  rawIdea: "",
  clarifications: [],
};

// ─── Assistant & State Types ───────────────────────────────────────────────────

export type CaptureOutput = {
  problem: string;
  users: string[];
  goals: string[];
  value: string;
};

export type RoadmapItem = {
  id: string;
  text: string;
  column: "now" | "next" | "later";
};

export type PrdSection = {
  id: string;
  title: string;
  content: string;
  open: boolean;
  improving: boolean;
  color: string;
};

export type TraceRow = {
  id: string;
  requirement: string;
  epic: string;
  story: string;
  linkedCardId: string | null;
  commit: string | null;
  testCase: string | null;
  status: "complete" | "partial" | "missing" | "fail";
  expanded: boolean;
};

export type ActionLogEntry = {
  id: string;
  actionId: string;
  label: string;
  status: "success" | "running" | "error";
  message: string;
  timestamp: string;
};

export type KanbanCard = {
  id: string;
  title: string;
  epic: string;
  priority: "high" | "medium" | "low";
  estimate: number;
  assignee: string;
  column: "todo" | "inprogress" | "done";
  acceptance: string[];
  build?: {
    commits: string[];
    completedTaskCount: number;
  };
};

export type BuildCopilotSnapshot = {
  ideaText: string;
  captureOutput: CaptureOutput;
  vision: string;
  usp: string;
  vp: string;
  roadmap: RoadmapItem[];
  prdSections: PrdSection[];
  prdVersion: number;
  cards: KanbanCard[];
  rows: TraceRow[];
  actionLog?: ActionLogEntry[];
};

export type AssistantActionRequest = {
  actionId: string;
  snapshot: BuildCopilotSnapshot;
};

export type AssistantActionResponse = {
  message: string;
  cards?: KanbanCard[];
  summary?: string;
  blockers?: string[];
};

export function createBuildCopilotSnapshot(input: Partial<BuildCopilotSnapshot>): BuildCopilotSnapshot {
  return {
    ideaText: input.ideaText ?? "",
    captureOutput: input.captureOutput ?? { problem: "", users: [], goals: [], value: "" },
    vision: input.vision ?? "",
    usp: input.usp ?? "",
    vp: input.vp ?? "",
    roadmap: input.roadmap ?? [],
    prdSections: input.prdSections ?? [],
    prdVersion: input.prdVersion ?? 1,
    cards: input.cards ?? [],
    rows: input.rows ?? [],
    actionLog: input.actionLog ?? [],
  };
}

export function isBuildCopilotSnapshot(value: unknown): value is BuildCopilotSnapshot {
  if (!value || typeof value !== "object") return false;
  const v = value as BuildCopilotSnapshot;

  const hasStrings =
    typeof v.ideaText === "string" &&
    typeof v.vision === "string" &&
    typeof v.usp === "string" &&
    typeof v.vp === "string";

  const hasNested =
    v.captureOutput &&
    typeof v.captureOutput.problem === "string" &&
    Array.isArray(v.captureOutput.users) &&
    Array.isArray(v.captureOutput.goals) &&
    typeof v.captureOutput.value === "string";

  const hasArrays =
    Array.isArray(v.roadmap) &&
    Array.isArray(v.prdSections) &&
    typeof v.prdVersion === "number" &&
    Array.isArray(v.cards) &&
    Array.isArray(v.rows);

  if (!hasStrings || !hasNested || !hasArrays) return false;

  // Validate cards
  for (const card of v.cards) {
    if (typeof card.id !== "string" || typeof card.title !== "string" || typeof card.estimate !== "number") {
      return false;
    }
    if (card.build && (typeof card.build.completedTaskCount !== "number" || !Array.isArray(card.build.commits))) {
      return false;
    }
  }

  // Validate rows and links
  const cardIds = new Set(v.cards.map(c => c.id));
  for (const row of v.rows) {
    if (typeof row.id !== "string" || typeof row.requirement !== "string") return false;
    if (row.linkedCardId && !cardIds.has(row.linkedCardId)) return false;
  }

  return true;
}
