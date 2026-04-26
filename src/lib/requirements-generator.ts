import { IdeaRecord, RequirementsPack } from "@/lib/buildcopilot-types";
import { callClaude } from "@/lib/ai-client";

const SYSTEM_PROMPT = `You are a senior business analyst and technical product manager who writes production-quality requirements documents. Given a product idea and strategy, generate a complete PRD/BRD/FRD requirements pack. Return ONLY valid JSON — no explanation, no markdown outside the JSON.

Rules:
- Be specific to the product. No generic filler.
- PRD features must be concrete user-facing capabilities, not vague platitudes.
- FRD functional requirements must use "System shall..." format and be testable.
- FRD non-functional requirements must include specific measurable thresholds.
- Generate 6-8 functional requirements and 4-5 non-functional requirements minimum.
- Stakeholders must include all relevant roles for this specific product.`;

const SCHEMA = `{
  "prd": {
    "title": "string — PRD title",
    "objectives": ["string — 4-5 specific product objectives"],
    "personas": ["string — user persona names/roles"],
    "features": ["string — 5-7 concrete user-facing features"],
    "dependencies": ["string — 3-4 technical or organisational dependencies"],
    "releasePlan": ["string — 3 release milestones with scope"]
  },
  "brd": {
    "businessCase": "string — 2-3 sentences on business justification",
    "stakeholders": ["string — all relevant roles"],
    "assumptions": ["string — 3-4 business assumptions"],
    "constraints": ["string — 3-4 constraints (regulatory, technical, budget)"],
    "benefits": ["string — 4-5 quantified business benefits"]
  },
  "frd": {
    "functionalRequirements": [
      {
        "id": "FR-01",
        "text": "string — System shall... (testable requirement)",
        "priority": "high | medium | low"
      }
    ],
    "nonFunctionalRequirements": [
      {
        "id": "NFR-01",
        "category": "string — Performance | Security | Scalability | Availability | Compliance",
        "text": "string — measurable requirement with specific threshold"
      }
    ]
  }
}`;

export async function generateRequirementsPack(idea: IdeaRecord): Promise<RequirementsPack> {
  const strategyContext = idea.strategy
    ? `\nStrategy vision: ${idea.strategy.vision}\nMVP scope: ${idea.strategy.mvpScope.join("; ")}`
    : "";

  const userMessage = `Generate a complete requirements pack (PRD, BRD, FRD) for this product.

Raw idea: "${idea.rawIdea}"

Problem statement: ${idea.analysis.problemStatement}

Target users: ${idea.analysis.targetUsers.join(", ")}

Goals:
${idea.analysis.goals.map((g, i) => `${i + 1}. ${g}`).join("\n")}
${strategyContext}

Return exactly this JSON structure (no other text):
${SCHEMA}`;

  const json = await callClaude(userMessage, SYSTEM_PROMPT, 0.2);
  const pack = JSON.parse(json);

  return {
    ideaId: idea.ideaId,
    generatedAt: new Date().toISOString(),
    ...pack,
  };
}
