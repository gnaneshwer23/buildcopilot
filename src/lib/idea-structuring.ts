import {
  IdeaStructuringResponse,
  StructuringAnalysis,
  StructuringRequest,
} from "@/lib/buildcopilot-types";
import { callClaude } from "@/lib/ai-client";

const SYSTEM_PROMPT = `You are a senior product strategist with deep expertise in product discovery, user research, and problem framing. Your job is to analyze raw product ideas and return a structured analysis as a valid JSON object — nothing else.

Rules:
- Return ONLY valid JSON. No explanation, no markdown, no commentary.
- Be specific to the idea provided. Do not use generic filler.
- personas must have real-feeling names and concrete, specific pain points.
- successMetrics must be measurable (include numbers or percentages where possible).
- goals must be outcome-focused, not feature-focused.`;

const SCHEMA = `{
  "problemStatement": "string — 2-3 sentences clearly framing the problem",
  "targetUsers": ["string — specific user roles"],
  "goals": ["string — 3-5 outcome-focused goals"],
  "usp": "string — concise unique value proposition",
  "assumptions": ["string — 3-4 key assumptions to validate"],
  "successMetrics": ["string — 3-5 measurable KPIs"],
  "personas": [
    {
      "name": "string",
      "role": "string",
      "painPoint": "string — specific and concrete",
      "goal": "string — what they want to achieve"
    }
  ]
}`;

export async function structureIdea(
  input: StructuringRequest,
): Promise<IdeaStructuringResponse> {
  const clarificationSection =
    input.clarifications?.length
      ? `\n\nAdditional context:\n${input.clarifications.map((c, i) => `${i + 1}. ${c}`).join("\n")}`
      : "";

  const userMessage = `Analyze this product idea and return the structured JSON analysis.

Raw idea:
"${input.rawIdea}"${clarificationSection}

Return exactly this JSON structure (no other text):
${SCHEMA}`;

  const json = await callClaude(userMessage, SYSTEM_PROMPT);
  const analysis: StructuringAnalysis = JSON.parse(json);

  return {
    ideaId: crypto.randomUUID(),
    generatedAt: new Date().toISOString(),
    stepStatus: { S01: "done", S02: "done", S03: "done" },
    clarificationQuestions: [
      "What business outcome should improve if this succeeds?",
      "Who is blocked today and how often?",
      "What is the smallest shippable version in 30 days?",
      "What does success look like in measurable terms?",
      "What should stay out of scope for now?",
    ],
    analysis,
  };
}
