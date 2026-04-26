import { RequirementsPack, BacklogPack } from "@/lib/buildcopilot-types";
import { callClaude } from "@/lib/ai-client";

const SYSTEM_PROMPT = `You are an agile delivery lead who writes production-quality user stories for development teams. Given a requirements pack, generate a structured backlog of epics and user stories. Return ONLY valid JSON — no explanation, no markdown outside the JSON.

Rules:
- Be specific to the product. No generic stories.
- Each epic must have 2-4 user stories minimum.
- Stories must follow "As a [role], I want to [action], so that [benefit]" format.
- Acceptance criteria must be testable — use Given/When/Then or bullet criteria.
- Story IDs follow US-01, US-02 format. Epic IDs follow EPIC-01 format.
- Link each story to its requirementId from the FRD.
- Create 3-5 epics covering the full product scope.`;

const SCHEMA = `{
  "epics": [
    {
      "id": "EPIC-01",
      "title": "string — epic theme",
      "description": "string — what this epic covers and why",
      "stories": [
        {
          "id": "US-01",
          "requirementId": "string — FR-XX from requirements",
          "title": "string — concise story title",
          "asA": "string — user role",
          "iWantTo": "string — action/capability",
          "soThat": "string — business value/benefit",
          "acceptanceCriteria": [
            "string — testable criterion (Given/When/Then or bullet)"
          ]
        }
      ]
    }
  ]
}`;

export async function generateBacklogPack(
  requirements: RequirementsPack,
  context?: { rawIdea?: string; vision?: string },
): Promise<BacklogPack> {
  const contextSection = context?.rawIdea
    ? `\nProduct: "${context.rawIdea}"${context.vision ? `\nVision: ${context.vision}` : ""}\n`
    : "";

  const frList = requirements.frd.functionalRequirements
    .map((r) => `${r.id} [${r.priority}]: ${r.text}`)
    .join("\n");

  const featureList = requirements.prd.features.map((f, i) => `${i + 1}. ${f}`).join("\n");

  const userMessage = `Generate an agile backlog with epics and user stories for this product.
${contextSection}
Functional requirements:
${frList}

Key features:
${featureList}

Personas: ${requirements.prd.personas.join(", ")}

Return exactly this JSON structure (no other text):
${SCHEMA}`;

  const json = await callClaude(userMessage, SYSTEM_PROMPT, 0.3);
  const pack = JSON.parse(json);

  return {
    ideaId: requirements.ideaId,
    generatedAt: new Date().toISOString(),
    epics: pack.epics,
  };
}
