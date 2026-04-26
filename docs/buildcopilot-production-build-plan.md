# BuildCopilot Production Build Plan

## Objective

Build BuildCopilot into a production-ready AI Delivery Intelligence System that connects:

Idea -> Strategy -> PRD -> Stories -> Code -> Validation -> Insight

Core USP:

- Traceability
- Validation
- Intelligence

## Current Baseline

The repository already has a meaningful starting point:

- Landing page flow for structuring, review, requirements, integrations, and architecture planning
- BuildCopilot runtime with modules for Capture, Strategy, Draft, Breakdown, Build, Verify, and Insight
- File-backed BuildCopilot session persistence
- Assistant action execution and action log persistence
- Validation around BuildCopilot state and assistant action APIs
- Vitest coverage for state validation and assistant action routes

This plan assumes the next work is not greenfield. It is a staged conversion from demo-capable product surfaces into a production system.

## Delivery Principles

- Keep Verify as the center of gravity. That is the differentiator.
- Do not build enterprise controls before the core loop is defensible.
- Every phase must end with a user-visible outcome, not just plumbing.
- Every phase must preserve end-to-end traceability from requirement to validation signal.
- No phase ships without lint, build, and targeted test coverage for the touched slice.

## Phase Map

### Phase 1 — Foundation MVP

Goal:

Make idea -> PRD -> stories -> basic tracking work reliably.

Build:

- Capture: idea input, AI structuring, saved structured output
- Strategy: editable vision, roadmap, prioritization surface
- Draft: PRD generator and editor
- Breakdown: epics and story creation
- Basic Insight: simple dashboard driven by current product data

Explicitly defer:

- Deep validation logic
- GitHub code linking
- Advanced AI agent orchestration

Repository outcome:

- Product managers can move from raw idea to usable backlog without leaving BuildCopilot
- Session state persists cleanly and can be restored
- Basic product metrics are visible in-app

Exit criteria:

- Capture, Strategy, Draft, Breakdown, and Insight all function without mocks for core happy paths
- Story generation is usable for real planning sessions
- Save/load behavior is reliable under repeated edits
- All current route tests pass, plus coverage exists for any new MVP APIs

Verification:

- `npm test`
- `npm run lint`
- `npm run build`

### Phase 2 — Delivery System

Goal:

Connect product planning to engineering execution.

Build:

- Build module: sprint board, task tracking, dev assignment, status progression
- Breakdown module: acceptance criteria authoring and editing
- Insight module: velocity, progress, throughput, simple release readiness
- Integrations: Jira and Linear push/sync path for backlog items

Repository outcome:

- Stories become execution units with assignees, estimates, and status
- Delivery teams can sync the backlog into delivery tools
- Insight reflects engineering progress rather than only static product data

Exit criteria:

- Cards can move cleanly from backlog to active delivery states
- Acceptance criteria exists at story level and persists
- Jira/Linear integration paths are functional and observable
- Insight surfaces live progress and sprint status from actual runtime state

Verification:

- Route tests for integration success/failure paths
- Component tests for card movement and acceptance-criteria persistence
- `npm test`
- `npm run lint`
- `npm run build`

### Phase 3 — Core USP

Goal:

Build what makes BuildCopilot unique: traceability and validation.

Build:

- Verify module: traceability engine from requirement -> epic -> story -> task -> code -> test -> validation result
- Verify module: validation logic for requirement fit, missing links, and gap detection
- Build module: GitHub code linking and commit association
- Insight module: validation coverage, missing-link detection, pass/fail reporting

Repository outcome:

- BuildCopilot can prove whether what was built matches what was planned
- Missing links become first-class product signals, not manual review work

Exit criteria:

- Traceability chain is represented in both data model and UI
- Validation engine can detect missing commits, tests, or requirement mismatches
- GitHub links persist and render in the runtime
- Insight exposes validation metrics and risk signals

Verification:

- Unit tests for traceability derivation and validation rules
- Route tests for GitHub linking and validation APIs
- End-to-end happy path from requirement to validation result
- `npm test`
- `npm run lint`
- `npm run build`

### Phase 4 — AI Intelligence

Goal:

Make the system actively intelligent rather than passively structured.

Build:

- Module-specific AI agents: Capture, Strategy, Draft, Breakdown, Build, Verify, Insight
- Risk prediction from delivery and validation signals
- Auto-PRD improvements
- Auto-story generation from requirements and change requests
- AI-generated reporting and stakeholder summaries

Repository outcome:

- AI becomes embedded in each module with a clear job, not a generic assistant overlay
- Reporting and planning acceleration are materially better than manual operation

Exit criteria:

- Each agent has a narrow contract and observable output
- AI actions are logged, replayable where appropriate, and safe under concurrent usage
- Failure paths produce useful operator feedback
- Generated content improves existing workflows rather than duplicating them

Verification:

- Route tests for each AI action contract
- Snapshot tests or structured assertions for agent output shape
- Concurrency and failure-path tests for assistant orchestration
- `npm test`
- `npm run lint`
- `npm run build`

### Phase 5 — Enterprise Layer

Goal:

Scale the product for real organizational use and sale.

Build:

- Multi-team and workspace isolation
- Permissions and role-based access
- Audit logs and change accountability
- Cost tracking and usage visibility
- Advanced dashboards for leadership and operations

Repository outcome:

- BuildCopilot can support multiple teams, distinct responsibilities, and governance requirements
- Enterprise buyers can evaluate security, auditability, and operational control

Exit criteria:

- Data access is scoped by team and role
- Critical actions are auditable
- Dashboard views exist for delivery leadership, product, and governance stakeholders
- Cost and usage data is available for platform control

Verification:

- Authorization and access-control tests
- Audit-log integrity checks
- `npm test`
- `npm run lint`
- `npm run build`

## Recommended PR Sequence

Use PR-sized steps inside the phase plan. Recommended order:

1. Stabilize shared BuildCopilot domain types across landing page and runtime
2. Finish real MVP persistence and editing flows for Capture, Strategy, Draft, Breakdown
3. Make Insight consume real runtime data everywhere
4. Add delivery-system persistence for sprint/task state and acceptance criteria
5. Finish Jira/Linear backlog sync with observability and tests
6. Implement traceability data model and derived links
7. Add validation engine rules and validation UI
8. Add GitHub code-linking path
9. Add validation metrics into Insight
10. Layer in module-specific AI actions and risk prediction
11. Add enterprise governance and multi-team support

## Parallel Workstreams

Parallelism is only safe after the shared data contracts are stable.

After Phase 1 domain stabilization:

- Frontend track: Capture, Strategy, Draft, Breakdown UX polish
- Platform track: persistence, integrations, route contracts, validation APIs
- Intelligence track: assistant actions, summaries, risk signals

After Phase 2:

- Verify track: traceability + validation engine
- Delivery track: GitHub linkage + sprint execution improvements
- Insight track: reporting and metrics depth

## Team Plan

Minimum viable team:

- Product lead: vision, PRD, prioritization, release decisions
- Full-stack engineer: shared product architecture, APIs, persistence, integrations
- Frontend engineer: runtime UX, landing page UX, dashboards, workflows
- AI engineer optional: agent contracts, generation quality, evaluation harnesses

Suggested ownership split:

- Product lead owns acceptance criteria and phase exit decisions
- Full-stack engineer owns data models, APIs, persistence, integrations
- Frontend engineer owns module UX, state flows, dashboard surfaces
- AI engineer owns prompt contracts, action orchestration, evaluation quality

## Metrics to Track Early

MVP metrics:

- PRD creation time < 5 min
- Story generation time < 2 min
- User adoption > 50 users
- Completion rate > 60%

USP metrics:

- Traceability coverage
- Validation success rate
- Missing links detected

Operational metrics:

- Integration success rate
- AI action failure rate
- Time from idea to sprint-ready backlog
- Time from requirement to validated build

## Biggest Risks

1. Overbuilding

Mitigation:

- Phase-gated delivery
- Defer enterprise and advanced AI until Verify is defensible

2. Too-complex UX

Mitigation:

- Keep product surfaces Notion/Linear-simple
- Prefer progressive disclosure over dense control panels

3. Weak differentiation

Mitigation:

- Keep Verify and validation metrics at the center of roadmap priority
- Do not let integrations or dashboards outrank traceability work

## Final Build Order

Build in this order:

1. Capture UI
2. Strategy page
3. PRD generator
4. Story generator
5. Kanban board
6. Basic dashboard
7. Traceability table
8. Validation engine

## Immediate Next Build Steps

The next execution slice should stay inside Phase 1 and Phase 2 foundations.

### Next 3 PRs

#### PR 1 — Shared BuildCopilot Domain Contract

Goal:

Remove drift between the landing page planning model and the BuildCopilot runtime model.

Build:

- Consolidate shared BuildCopilot phase, module, and status contracts in `src/lib/`
- Remove remaining duplicated heuristics where possible
- Add tests around shared execution-model helpers

Exit criteria:

- Landing page and runtime use the same planning primitives
- Shared helpers have direct unit coverage

#### PR 2 — Phase 1 Runtime Persistence Completion

Goal:

Finish the real MVP persistence loop for Capture, Strategy, Draft, Breakdown, and Insight.

Build:

- Ensure all Phase 1 module edits persist and restore cleanly
- Tighten save/load behavior around roadmap, PRD sections, stories, and dashboard inputs
- Add behavior-scoped tests for persistence-sensitive flows

Exit criteria:

- Users can leave and return without losing core Phase 1 work
- No module in Phase 1 relies on demo-only assumptions for state continuity

#### PR 3 — Delivery-System State and Acceptance Criteria

Goal:

Start Phase 2 by making stories real execution units.

Build:

- Persist story-level acceptance criteria
- Persist sprint/task state and assignment fields
- Make the Build and Insight modules consume the same delivery-state model

Exit criteria:

- Story detail, execution status, and insight metrics update from persisted delivery data
- Build module no longer behaves like a mostly derived mock view

### Immediate Guardrails

- Do not start GitHub code linking before delivery-state persistence is stable
- Do not start advanced AI agent work before Verify inputs are trustworthy
- Keep every next PR small enough to validate with targeted tests plus `npm run lint` and `npm run build`

## Definition of Done

BuildCopilot is production-ready when all of the following are true:

- A user can go from idea to backlog inside BuildCopilot
- Delivery work can be tracked and synced to external systems
- Every requirement can be linked to downstream execution artifacts
- Validation can prove whether the build matches the plan
- Insight surfaces live delivery and validation metrics
- AI actions accelerate work without weakening operator control
- Governance, auditability, and multi-team boundaries are in place for enterprise use

## Anti-Patterns to Avoid

- Building AI agents before the core product loop is reliable
- Building enterprise controls before Verify is strong
- Treating dashboards as the product instead of the outcome of the product
- Letting the landing page and runtime drift into different domain models
- Shipping validation claims without real traceability evidence