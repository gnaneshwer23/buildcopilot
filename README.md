# BuildCopilot AI

Execution Intelligence Platform implementation workspace.

## Current Build Status

Implemented now:

1. S01-S03 flow: raw idea intake and structuring output
2. Review workflow: approve, request changes, reject with reviewer role and notes
3. S04 generation: product strategy output saved per idea
4. S05 generation: PRD/BRD/FRD draft pack saved per idea
5. Artifact versioning for S04 and S05 with change summaries
6. Manual S04/S05 edits that save as new versions
7. Field-level diff tracking per version
8. Local persistence via data file store at data/ideas.json
9. Optional Supabase persistence mode with same API contracts
10. Jira push adapter (dry-run supported)
11. Confluence push adapter (dry-run supported)
12. Linear push adapter (dry-run supported)
13. Export package generation for markdown, json, and docx
14. Integration audit trail persisted per idea with retry workflow
15. Scheduled sync jobs for selected integration targets
16. Integration policy controls by environment and actor role
17. Bulk multi-idea export and push operations
18. Scheduler observability dashboard with throughput and failure metrics
19. Signed webhook trigger support for scheduler runs
20. Bulk idempotency keys and bounded concurrency controls
21. Policy simulation mode for environment and role rollout testing
22. Scheduler dead-letter handling for repeated failures
23. Webhook replay protection via signature/timestamp ledger
24. Bulk execution telemetry (duration, queue depth, error buckets)
25. Dead-letter replay endpoint for controlled scheduler reactivation
26. BuildCopilot 7-layer architecture map and builder prompt assets
27. Persistent webhook replay ledger for multi-instance safety
28. BuildCopilot production build phases embedded in landing page architecture panel
29. Runtime Production Build Plan card inside BuildCopilot workspace
30. Shared phase-status helper used by both landing page and BuildCopilot runtime
31. Phase-gate status aligned to build phases instead of legacy S01-S12-only steps
32. Production build blueprint documented in repo docs

## API Endpoints

- GET /api/ideas
- GET /api/health/persistence
- POST /api/ideas/structure
- POST /api/ideas/[ideaId]/review
- POST /api/ideas/[ideaId]/strategy
- PUT /api/ideas/[ideaId]/strategy
- POST /api/ideas/[ideaId]/requirements
- PUT /api/ideas/[ideaId]/requirements
- GET /api/ideas/[ideaId]/history
- GET /api/ideas/[ideaId]/export?format=markdown|json|docx
- POST /api/ideas/bulk/export
- GET /api/ideas/[ideaId]/integrations/logs
- POST /api/ideas/[ideaId]/integrations/retry
- GET /api/ideas/[ideaId]/integrations/schedules
- POST /api/ideas/[ideaId]/integrations/schedules
- POST /api/ideas/[ideaId]/integrations/schedules/[jobId]/replay
- POST /api/integrations/jira/push
- POST /api/integrations/confluence/push
- POST /api/integrations/linear/push
- POST /api/integrations/bulk/push
- POST /api/integrations/scheduler/run-due
- GET /api/integrations/scheduler/metrics
- POST /api/integrations/scheduler/webhook
- POST /api/integrations/policy/simulate

## BuildCopilot Architecture

Named layer model:

1. BuildCopilot Capture (`idea_engine`)
2. BuildCopilot Strategy (`strategy_engine`)
3. BuildCopilot Draft (`prd_engine`)
4. BuildCopilot Breakdown (`backlog_engine`)
5. BuildCopilot Build (`execution_engine`)
6. BuildCopilot Verify (`validation_engine`)
7. BuildCopilot Insight (`analytics_engine`)

System loop:

Capture -> Strategy -> Draft -> Breakdown -> Build -> Verify -> Insight -> Capture

Builder prompt assets are available in:

1. [docs/buildcopilot-system-architecture.md](docs/buildcopilot-system-architecture.md)
2. [src/lib/buildcopilot-architecture.ts](src/lib/buildcopilot-architecture.ts)
3. [docs/buildcopilot-production-build-plan.md](docs/buildcopilot-production-build-plan.md)

Execution model assets are available in:

1. [src/lib/buildcopilot-phase-status.ts](src/lib/buildcopilot-phase-status.ts)
2. [src/lib/buildcopilot-phase-status.test.ts](src/lib/buildcopilot-phase-status.test.ts)

## Tech

- Next.js 16.2.4 (App Router, webpack build)
- TypeScript
- Tailwind CSS 4

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment

Copy `.env.example` to `.env.local` when enabling external model providers.

MVP 1 currently runs in deterministic local mode and does not require API keys.

Persistence options:

1. `BUILDCOPILOT_PERSISTENCE=file` (default)
2. `BUILDCOPILOT_PERSISTENCE=supabase` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

For Supabase mode, apply migration [db/002_supabase_storage.sql](db/002_supabase_storage.sql).

For persistent webhook replay protection in Supabase mode, also apply:

1. [db/003_webhook_replay_ledger.sql](db/003_webhook_replay_ledger.sql)

To migrate existing local data into Supabase:

```bash
npm run migrate:file-to-supabase
```

The persistence status endpoint [src/app/api/health/persistence/route.ts](src/app/api/health/persistence/route.ts) reports the active mode and connectivity.

Integration options:

1. Jira: set `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY`
2. Confluence: set `CONFLUENCE_BASE_URL`, `CONFLUENCE_EMAIL`, `CONFLUENCE_API_TOKEN`, `CONFLUENCE_SPACE_KEY`
3. Linear: set `LINEAR_API_KEY`, `LINEAR_TEAM_ID`

If credentials are missing, integration routes automatically return a dry-run payload preview.

Scheduler option:

1. Set `BUILDCOPILOT_SCHEDULER_SECRET` and pass it as `x-buildcopilot-scheduler-secret` header when calling `/api/integrations/scheduler/run-due`
2. Set `BUILDCOPILOT_SCHEDULER_DEAD_LETTER_FAILURES` (default 3) to auto-disable jobs after repeated failed runs
3. For signed webhooks, set `BUILDCOPILOT_SCHEDULER_WEBHOOK_SECRET` and optionally `BUILDCOPILOT_SCHEDULER_WEBHOOK_TOLERANCE_SECONDS`
4. Replay protection: duplicate timestamp+signature webhook payloads are rejected (`409`)
5. Optional replay ledger retention: `BUILDCOPILOT_SCHEDULER_WEBHOOK_REPLAY_TTL_SECONDS` (default 600)
6. Replay keys are persisted in storage (file or Supabase) to protect multi-instance deployments
7. Webhook request contract for `/api/integrations/scheduler/webhook`:

```text
Headers:
	x-buildcopilot-webhook-timestamp: <unix-seconds>
	x-buildcopilot-webhook-signature: <hex-hmac-sha256>

Signature payload:
	"<timestamp>.<raw_request_body>"

HMAC:
	HMAC_SHA256(payload, BUILDCOPILOT_SCHEDULER_WEBHOOK_SECRET)
```

Dead-letter replay option:

1. POST `/api/ideas/[ideaId]/integrations/schedules/[jobId]/replay`
2. Request body supports `runNow` (default true) and `dryRunOverride`
3. Reactivates dead-lettered jobs and can execute immediate controlled replay

Integration policy options:

1. `BUILDCOPILOT_DEPLOYMENT_ENV` to define active environment label (`development`, `staging`, `production`, etc.)
2. `BUILDCOPILOT_INTEGRATION_POLICY_JSON` to restrict targets by environment and role
3. Example policy JSON:

```json
{
	"environments": {
		"production": ["jira", "confluence"],
		"staging": ["jira", "confluence", "linear"]
	},
	"roles": {
		"Product Manager": ["jira", "linear"],
		"Business Analyst": ["confluence"],
		"Sponsor": ["confluence"],
		"System": ["jira"]
	}
}
```

Policy simulation mode:

1. POST `/api/integrations/policy/simulate`
2. Optional request body fields: `environment`, `actorRoles[]`, `targets[]`
3. Returns allow/block decisions with reasons for each role-target pair

Bulk operation controls:

1. `BUILDCOPILOT_BULK_CONCURRENCY` sets max concurrent workers per bulk request (default 5, capped at 20)
2. Optional idempotency header for bulk endpoints:

```text
x-idempotency-key: <client-generated-unique-key>
```

3. Reusing a key with identical payload returns cached response (`x-idempotency-hit: true`)
4. Reusing a key with different payload returns `409 Conflict`
5. Bulk responses include `telemetry` with duration, queue depth, and error bucket counts
6. Idempotency cache is persisted to `data/idempotency-cache.json` (file mode) or `buildcopilot_idempotency_cache` table (Supabase mode) for multi-instance safety

### Webhook replay ledger observability

`GET /api/integrations/scheduler/webhook/replay-metrics` — returns live stats:
- `backend` (`file` | `supabase`), `totalEntries`, `activeEntries`, `expiredEntries`
- `oldestActiveExpiresAt` / `newestActiveExpiresAt`
- Surfaced as **Webhook Replay Ledger** panel in the Review Queue section

### Scheduler replay audit log

Dead-letter replays now record operator attribution:
- `replayedBy` field in `POST .../replay` request body (default: `"operator"`)
- Each replay appends to `replayAuditLog[]` on the `ScheduledSyncJob` — stores `replayedAt`, `replayedBy`, `runExecuted`, `resultOk`, `resultMessage`
- Last 3 audit entries shown inline per job in the UI
- `recordScheduledSyncRun` patches the pending audit entry with run result after execution

## Next Planned Work

1. Persist explicit BuildCopilot phase completion flags instead of relying on heuristics
2. Add route/component coverage around landing-page phase gating and runtime execution-plan surfaces
3. Finish Phase 1 production work: real persistence and editing depth across Capture, Strategy, Draft, Breakdown, and Insight
4. Add delivery-system persistence for sprint/task state and acceptance criteria
5. Complete Jira/Linear sync observability and harden release-readiness signals
