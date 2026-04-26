import { IdeaRecord, ProductStrategy } from "@/lib/buildcopilot-types";
import { callClaude } from "@/lib/ai-client";

const SYSTEM_PROMPT = `You are a product strategy director who has shipped B2B SaaS products at scale. Given a structured product idea, you generate a complete product strategy. Return ONLY valid JSON — no explanation, no markdown, no commentary outside the JSON block.

Rules:
- Be specific to the idea. Do not generate generic copy.
- mvpScope: exactly what ships in the first 8 weeks, 3-5 items.
- nonGoals: explicitly what is out of scope and why, 3-4 items.
- roadmapNowNextLater: now = 0-3 months, next = 3-9 months, later = 9-24 months.
- prioritization: top 4-5 scope items scored by RICE or MoSCoW with specific rationale.
- successMetrics: measurable with targets (e.g., "90% of users complete onboarding in < 5 minutes").`;

const SCHEMA = `{
  "vision": "string — inspiring 1-sentence product vision",
  "marketPosition": "string — 1-2 sentences on market positioning",
  "businessModel": "string — revenue model and unit economics summary",
  "mvpScope": ["string — 3-5 specific MVP deliverables"],
  "nonGoals": ["string — 3-4 explicit out-of-scope items"],
  "roadmapNowNextLater": {
    "now": ["string — 2-4 immediate priorities (0-3 months)"],
    "next": ["string — 2-4 next priorities (3-9 months)"],
    "later": ["string — 2-3 future bets (9-24 months)"]
  },
  "prioritization": [
    {
      "item": "string — scope item name",
      "method": "RICE",
      "rationale": "string — specific RICE reasoning"
    }
  ],
  "successMetrics": ["string — 4-5 measurable KPIs with targets"]
}`;

export async function generateProductStrategy(idea: IdeaRecord): Promise<ProductStrategy> {
  const userMessage = `Generate a product strategy for this idea.

Problem statement: ${idea.analysis.problemStatement}

Target users: ${idea.analysis.targetUsers.join(", ")}

Goals:
${idea.analysis.goals.map((g, i) => `${i + 1}. ${g}`).join("\n")}

USP: ${idea.analysis.usp}

Success metrics: ${idea.analysis.successMetrics.join("; ")}

Return exactly this JSON structure (no other text):
${SCHEMA}`;

  const json = await callClaude(userMessage, SYSTEM_PROMPT);
  const strategy = JSON.parse(json);

  return {
    ideaId: idea.ideaId,
    generatedAt: new Date().toISOString(),
    ...strategy,
  };
}
