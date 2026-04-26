# BuildCopilot System Architecture

This document defines the BuildCopilot product architecture, internal module naming, production build phases, and builder prompts.

## Product Definition

BuildCopilot is an AI Delivery Intelligence System that connects:

Idea -> Strategy -> PRD -> Stories -> Code -> Validation -> Insight

Core USP:

- Traceability
- Validation
- Intelligence

## Architecture Layers

1. BuildCopilot Capture
- Internal module: idea_engine
- Purpose: brainstorming, idea refinement, problem definition
- Outputs: problem statement, personas, goals

2. BuildCopilot Strategy
- Internal module: strategy_engine
- Purpose: USP definition, market positioning, product vision
- Outputs: strategy doc, value proposition, roadmap draft

3. BuildCopilot Draft
- Internal module: prd_engine
- Purpose: PRD, BRD, FRD generation
- Outputs: PRD, features, metrics, risks

4. BuildCopilot Breakdown
- Internal module: backlog_engine
- Purpose: epics, user stories, acceptance criteria
- Outputs: backlog, sprint-ready stories

5. BuildCopilot Build
- Internal module: execution_engine
- Purpose: development tasks, code tracking, sprint execution
- Outputs: code, PRs, build status

6. BuildCopilot Verify
- Internal module: validation_engine
- Purpose: validation engine, traceability, testing
- Outputs: pass/fail, coverage, gap detection

7. BuildCopilot Insight
- Internal module: analytics_engine
- Purpose: metrics, reporting, dashboards
- Outputs: progress, risk, ROI

## System Loop

Capture -> Strategy -> Draft -> Breakdown -> Build -> Verify -> Insight -> Capture

## Production Build Phases

### Phase 1 — Foundation

Goal:

Make idea -> PRD -> stories -> basic tracking work.

Build:

- Capture: idea input, AI structuring
- Strategy: vision, roadmap
- Draft: PRD generator
- Breakdown: epics, stories
- Basic Insight: simple dashboard

Hold for later:

- Deep validation
- Git integration
- Advanced AI

### Phase 2 — Delivery System

Goal:

Connect product work to engineering execution.

Build:

- Build: sprint + task tracking
- Breakdown: acceptance criteria
- Insight: velocity and progress
- Integration: Jira / Linear sync

### Phase 3 — Core USP

Goal:

Build the differentiation.

Build:

- Verify: traceability engine
- Verify: validation logic
- Build: GitHub code linking
- Insight: validation metrics

### Phase 4 — AI Intelligence

Goal:

Make the system smart.

Build:

- AI agents per module
- Risk prediction
- Auto PRD improvements
- Auto story generation
- AI reporting

### Phase 5 — Enterprise Layer

Goal:

Scale and sell.

Build:

- Multi-team support
- Permissions
- Audit logs
- Cost tracking
- Advanced dashboards

## Final Build Order

1. Capture UI
2. Strategy page
3. PRD generator
4. Story generator
5. Kanban board
6. Basic dashboard
7. Traceability table
8. Validation engine

## Runtime Planning Surfaces

The current repository exposes this architecture in three places:

1. Landing-page architecture panel and phase gate widget in [src/app/page.tsx](../src/app/page.tsx)
2. Runtime Production Build Plan card in [src/app/buildcopilot/BuildCopilotClient.tsx](../src/app/buildcopilot/BuildCopilotClient.tsx)
3. Shared phase-status logic in [src/lib/buildcopilot-phase-status.ts](../src/lib/buildcopilot-phase-status.ts)

## Master Build Prompt

Build a full-stack AI-powered product delivery platform called "BuildCopilot".
The system should function as an end-to-end delivery intelligence platform that connects idea -> strategy -> requirements -> backlog -> development -> validation -> reporting.
Create the following modules as separate but connected layers:
1. BuildCopilot Capture
- Input: raw ideas
- Output: structured problem statements, personas, goals
- UI: text input + AI suggestions + refinement panel
2. BuildCopilot Strategy
- Input: problem statements
- Output: USP, value proposition, roadmap
- UI: editable strategy document with AI suggestions
3. BuildCopilot Draft
- Input: strategy
- Output: full PRD (problem, users, solution, features, metrics, risks)
- UI: structured document editor
4. BuildCopilot Breakdown
- Input: PRD
- Output: epics, user stories, acceptance criteria
- UI: backlog board (like Jira)
5. BuildCopilot Build
- Input: user stories
- Output: development tasks, code links, sprint tracking
- UI: kanban board + developer panel
6. BuildCopilot Verify
- Input: code + acceptance criteria
- Output: validation results (pass/fail), coverage, gaps
- UI: traceability table showing:
  requirement -> story -> code -> test -> status
7. BuildCopilot Insight
- Input: all system data
- Output: dashboards with:
  - delivery metrics
  - validation metrics
  - product metrics
  - risk indicators
- UI: executive dashboard
Core features:
- Auto-link all layers (traceability)
- Show missing links as alerts
- Generate daily/weekly reports automatically
- Maintain a real-time system loop
Design style:
- Clean, minimal UI like Linear / Notion
- Dark mode default
- Left sidebar navigation with modules
- Main panel = workspace
- Right panel = insights / AI suggestions
Goal:
Create a system where every idea can be tracked, built, validated, and reported automatically.

## Workflow Asset

The full validated Mermaid workflow is maintained in:

1. [src/lib/buildcopilot-architecture.ts](../src/lib/buildcopilot-architecture.ts) via `BUILDCOPILOT_WORKFLOW_MERMAID`
2. Landing-page architecture panel copy surface in [src/app/page.tsx](../src/app/page.tsx)

## Advanced Agent Prompt

Add AI agents for each module:
- Capture Agent: refines ideas
- Strategy Agent: creates positioning
- Draft Agent: writes PRD
- Breakdown Agent: creates stories
- Build Agent: tracks dev progress
- Verify Agent: validates against acceptance criteria
- Insight Agent: generates reports and predictions
Each agent should:
- suggest improvements
- highlight risks
- automate repetitive tasks
