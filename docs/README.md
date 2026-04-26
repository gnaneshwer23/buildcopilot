# BuildCopilot — Docs

All documentation for the **BuildCopilot Delivery Intelligence OS** project.

## Source Documents

- **DI_Build_Doc1_Vision_Architecture.docx** — Product vision and system architecture
- **DI_Build_Doc2_Module_Specs.docx** — Module-level specs for all 7 phases
- **DI_Build_Doc3_Technical_Build.docx** — Technical build guide and engineering decisions
- **DI_Build_Doc4_GTM_Strategy.docx** — Go-to-market strategy and positioning
- **delivery-workbook.xlsx** — PM workbook — epics, stories, sprint tracking (S01–S21)
- **implementation-plan.md** — Phased plan with timelines (MVP 1–4 + Scale to 2027)

## Technical Docs

- **buildcopilot-system-architecture.md** — Architecture reference — 7 module definitions, layer design
- **buildcopilot-production-build-plan.md** — Production roadmap — staged conversion from demo to prod

## Module Map

```text
Capture → Strategy → Draft → Breakdown → Build → Verify → Insight
  ↑                                                          ↓
  └────────────────── Intelligence Loop ─────────────────────┘
```

## Key Codebase Files

- **src/app/page.tsx** — Root — landing → onboarding → workspace
- **src/components/WorkspaceClient.tsx** — Main workspace — all 7 modules, API-connected
- **src/components/LandingPage.tsx** — Marketing landing page
- **src/components/Onboarding.tsx** — 3-step personalised onboarding
- **src/app/api/ideas/\*** — Core AI pipeline — structure, strategy, requirements, backlog
- **src/app/api/integrations/\*** — Jira, Confluence, Linear push + scheduled sync
- **src/lib/buildcopilot-types.ts** — Master type definitions
- **src/lib/buildcopilot-types.ts** — Real-time state machine types
- **db/\*.sql** — Supabase schema migrations
