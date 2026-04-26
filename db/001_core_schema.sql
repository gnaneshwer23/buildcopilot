-- BuildCopilot AI - Phase 0 + MVP1 foundation schema
-- This migration is intentionally focused on S01-S03 artifacts.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL DEFAULT 'S01',
  raw_idea TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'captured',
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ideas_step_id_check CHECK (step_id IN ('S01', 'S02', 'S03')),
  CONSTRAINT ideas_status_check CHECK (status IN ('captured', 'structured', 'approved', 'rejected'))
);

CREATE TABLE IF NOT EXISTS idea_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  target_users JSONB NOT NULL DEFAULT '[]',
  goals JSONB NOT NULL DEFAULT '[]',
  usp TEXT NOT NULL,
  assumptions JSONB NOT NULL DEFAULT '[]',
  success_metrics JSONB NOT NULL DEFAULT '[]',
  personas JSONB NOT NULL DEFAULT '[]',
  clarifications JSONB NOT NULL DEFAULT '[]',
  model_provider TEXT NOT NULL DEFAULT 'local',
  model_name TEXT NOT NULL DEFAULT 'heuristic-v1',
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT idea_structures_step_id_check CHECK (step_id IN ('S01', 'S02', 'S03'))
);

CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  reviewer_role TEXT NOT NULL,
  reviewer_name TEXT,
  decision TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT approvals_step_id_check CHECK (step_id IN ('S01', 'S02', 'S03')),
  CONSTRAINT approvals_decision_check CHECK (decision IN ('approved', 'changes_requested', 'rejected'))
);

CREATE TABLE IF NOT EXISTS product_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  vision TEXT NOT NULL,
  market_position TEXT NOT NULL,
  business_model TEXT NOT NULL,
  mvp_scope JSONB NOT NULL DEFAULT '[]',
  non_goals JSONB NOT NULL DEFAULT '[]',
  roadmap_now_next_later JSONB NOT NULL DEFAULT '{}',
  prioritization JSONB NOT NULL DEFAULT '[]',
  success_metrics JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS requirements_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  prd JSONB NOT NULL DEFAULT '{}',
  brd JSONB NOT NULL DEFAULT '{}',
  frd JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trace_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id TEXT,
  story_id TEXT,
  branch_name TEXT,
  pull_request_id TEXT,
  test_id TEXT,
  evidence_doc TEXT,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT trace_links_status_check CHECK (status IN ('not_started', 'partial', 'complete', 'gap'))
);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ideas_project ON ideas(project_id);
CREATE INDEX IF NOT EXISTS idx_idea_structures_idea ON idea_structures(idea_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_product_strategies_idea ON product_strategies(idea_id);
CREATE INDEX IF NOT EXISTS idx_requirements_docs_idea ON requirements_docs(idea_id);
