-- BuildCopilot AI - Seeding Core Vision and Mock Data
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/qywuwcgljpgvibmxdfmd/sql

-- 1. Ensure the persistence table exists
CREATE TABLE IF NOT EXISTS buildcopilot_ideas (
  idea_id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Insert the Core Vision Data
INSERT INTO buildcopilot_ideas (idea_id, payload, updated_at)
VALUES (
  'buildcopilot-core-vision',
  '{
    "ideaId": "buildcopilot-core-vision",
    "rawIdea": "A single AI-powered delivery system that connects ideas, strategy, requirements, stories, code, documentation, meetings, risks, costs, and progress reporting with full traceability.",
    "generatedAt": "2026-04-26T10:16:24Z",
    "stepStatus": { "S01": "done", "S02": "done", "S03": "done" },
    "status": "approved",
    "analysis": {
      "problemStatement": "Teams work across too many disconnected tools (ChatGPT, Notion, Confluence, Jira, GitHub, Slack), leading to documentation drift, loss of context, and inefficient executive reporting.",
      "targetUsers": ["Product Managers", "Project Managers", "Business Analysts", "Technical Architects", "CTOs"],
      "goals": [
        "Eliminate documentation drift",
        "Connect product strategy to code execution",
        "Automate PRD and Story generation",
        "Real-time visibility into delivery risks and costs"
      ],
      "usp": "The first end-to-end AI Delivery Operating System with a closed-loop intelligence layer that validates code against requirements in real-time.",
      "assumptions": [
        "Users are willing to centralize their SDLC workflow",
        "AI models can accurately map code to business requirements",
        "Organizations need better traceability for compliance"
      ],
      "successMetrics": [
        "50% reduction in time from idea to PRD",
        "100% traceability from requirement to code commit",
        "Zero documentation drift"
      ],
      "personas": [
        { "name": "Sarah", "role": "Product Lead", "painPoint": "Docs drift.", "goal": "Living PRD" },
        { "name": "Dave", "role": "Eng Lead", "painPoint": "Outdated docs.", "goal": "Self-documenting" }
      ]
    },
    "strategy": {
      "vision": "Standard OS for delivery teams",
      "marketPosition": "AI-native alternative to Atlassian",
      "mvpScope": ["Idea Engine", "PRD Gen", "7-Folder Workspace", "Supabase Sync", "AI Scanner"],
      "roadmapNowNextLater": {
        "now": ["Workspace", "Supabase", "Gemini"],
        "next": ["Jira/Conf Sync", "GitHub Scanner"],
        "later": ["Predictive Costing"]
      }
    },
    "backlog": {
      "epics": [
        {
          "id": "EPIC-1",
          "title": "Idea to PRD Engine",
          "stories": [
            { "id": "S1", "title": "Idea Capture", "status": "done", "acceptanceCriteria": ["High contrast", "Auto-saves"] }
          ]
        },
        {
          "id": "EPIC-2",
          "title": "Traceability",
          "stories": [
            { "id": "S2", "title": "Supabase Sync", "status": "done", "acceptanceCriteria": ["Real-time", "Secure"] }
          ]
        }
      ]
    }
  }',
  NOW()
)
ON CONFLICT (idea_id) 
DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW();
