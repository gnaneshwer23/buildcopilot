import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { IdeaRecord } from "@/lib/buildcopilot-types";

export type ExportFormat = "markdown" | "json" | "docx";

export async function exportIdeaArtifact(
  idea: IdeaRecord,
  format: ExportFormat,
): Promise<{ content: string | Buffer; contentType: string; extension: string }> {
  if (format === "markdown") {
    return {
      content: toMarkdown(idea),
      contentType: "text/markdown; charset=utf-8",
      extension: "md",
    };
  }

  if (format === "json") {
    return {
      content: JSON.stringify(idea, null, 2),
      contentType: "application/json; charset=utf-8",
      extension: "json",
    };
  }

  const buffer = await toDocx(idea);
  return {
    content: buffer,
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extension: "docx",
  };
}

function toMarkdown(idea: IdeaRecord): string {
  const strategy = idea.strategy;
  const requirements = idea.requirements;

  const sections: string[] = [
    `# BuildCopilot Delivery Artifact`,
    "",
    `- Idea ID: ${idea.ideaId}`,
    `- Generated At: ${idea.generatedAt}`,
    `- Status: ${idea.status}`,
    "",
    "## Problem Framing (S01-S03)",
    `- Problem Statement: ${idea.analysis.problemStatement}`,
    `- Target Users: ${idea.analysis.targetUsers.join(", ")}`,
    `- USP: ${idea.analysis.usp}`,
    "",
    "### Goals",
    ...idea.analysis.goals.map((goal) => `- ${goal}`),
    "",
    "### Success Metrics",
    ...idea.analysis.successMetrics.map((metric) => `- ${metric}`),
    "",
    "### Assumptions",
    ...idea.analysis.assumptions.map((assumption) => `- ${assumption}`),
    "",
  ];

  if (strategy) {
    sections.push(
      "## Product Strategy (S04)",
      `- Vision: ${strategy.vision}`,
      `- Market Position: ${strategy.marketPosition}`,
      `- Business Model: ${strategy.businessModel}`,
      "",
      "### MVP Scope",
      ...strategy.mvpScope.map((item) => `- ${item}`),
      "",
      "### Non Goals",
      ...strategy.nonGoals.map((item) => `- ${item}`),
      "",
      "### Roadmap",
      "#### Now",
      ...strategy.roadmapNowNextLater.now.map((item) => `- ${item}`),
      "#### Next",
      ...strategy.roadmapNowNextLater.next.map((item) => `- ${item}`),
      "#### Later",
      ...strategy.roadmapNowNextLater.later.map((item) => `- ${item}`),
      "",
    );
  }

  if (requirements) {
    sections.push(
      "## Requirements Pack (S05)",
      `- PRD Title: ${requirements.prd.title}`,
      `- Business Case: ${requirements.brd.businessCase}`,
      "",
      "### Functional Requirements",
      ...requirements.frd.functionalRequirements.map(
        (item) => `- ${item.id} (${item.priority}): ${item.text}`,
      ),
      "",
      "### Non Functional Requirements",
      ...requirements.frd.nonFunctionalRequirements.map(
        (item) => `- ${item.id} (${item.category}): ${item.text}`,
      ),
    );
  }

  return sections.join("\n").trim();
}

async function toDocx(idea: IdeaRecord): Promise<Buffer> {
  const strategy = idea.strategy;
  const requirements = idea.requirements;

  const children: Paragraph[] = [
    new Paragraph({
      text: "BuildCopilot Delivery Artifact",
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({ text: `Idea ID: ${idea.ideaId}` }),
    new Paragraph({ text: `Generated At: ${idea.generatedAt}` }),
    new Paragraph({ text: `Status: ${idea.status}` }),
    new Paragraph({ text: "" }),
    new Paragraph({
      text: "Problem Framing (S01-S03)",
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({ text: `Problem Statement: ${idea.analysis.problemStatement}` }),
    new Paragraph({ text: `Target Users: ${idea.analysis.targetUsers.join(", ")}` }),
    new Paragraph({ text: `USP: ${idea.analysis.usp}` }),
    new Paragraph({ text: "Goals", heading: HeadingLevel.HEADING_2 }),
    ...toBullets(idea.analysis.goals),
    new Paragraph({ text: "Success Metrics", heading: HeadingLevel.HEADING_2 }),
    ...toBullets(idea.analysis.successMetrics),
    new Paragraph({ text: "Assumptions", heading: HeadingLevel.HEADING_2 }),
    ...toBullets(idea.analysis.assumptions),
  ];

  if (strategy) {
    children.push(
      new Paragraph({ text: "" }),
      new Paragraph({
        text: "Product Strategy (S04)",
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({ text: `Vision: ${strategy.vision}` }),
      new Paragraph({ text: `Market Position: ${strategy.marketPosition}` }),
      new Paragraph({ text: `Business Model: ${strategy.businessModel}` }),
      new Paragraph({ text: "MVP Scope", heading: HeadingLevel.HEADING_2 }),
      ...toBullets(strategy.mvpScope),
      new Paragraph({ text: "Non Goals", heading: HeadingLevel.HEADING_2 }),
      ...toBullets(strategy.nonGoals),
      new Paragraph({ text: "Roadmap Now", heading: HeadingLevel.HEADING_2 }),
      ...toBullets(strategy.roadmapNowNextLater.now),
      new Paragraph({ text: "Roadmap Next", heading: HeadingLevel.HEADING_2 }),
      ...toBullets(strategy.roadmapNowNextLater.next),
      new Paragraph({ text: "Roadmap Later", heading: HeadingLevel.HEADING_2 }),
      ...toBullets(strategy.roadmapNowNextLater.later),
    );
  }

  if (requirements) {
    children.push(
      new Paragraph({ text: "" }),
      new Paragraph({
        text: "Requirements Pack (S05)",
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({ text: `PRD Title: ${requirements.prd.title}` }),
      new Paragraph({ text: `Business Case: ${requirements.brd.businessCase}` }),
      new Paragraph({ text: "Functional Requirements", heading: HeadingLevel.HEADING_2 }),
      ...toBullets(
        requirements.frd.functionalRequirements.map(
          (item) => `${item.id} (${item.priority}): ${item.text}`,
        ),
      ),
      new Paragraph({ text: "Non Functional Requirements", heading: HeadingLevel.HEADING_2 }),
      ...toBullets(
        requirements.frd.nonFunctionalRequirements.map(
          (item) => `${item.id} (${item.category}): ${item.text}`,
        ),
      ),
    );
  }

  const document = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(document);
}

function toBullets(items: string[]): Paragraph[] {
  return items.map(
    (item) =>
      new Paragraph({
        children: [new TextRun(item)],
        bullet: { level: 0 },
      }),
  );
}
