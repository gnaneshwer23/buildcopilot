import {
  IdeaRecord,
  IntegrationPushResponse,
} from "@/lib/buildcopilot-types";

type LinearPushOptions = {
  idea: IdeaRecord;
  dryRun?: boolean;
};

type LinearIssueResponse = {
  data?: {
    issueCreate?: {
      success: boolean;
      issue?: {
        id?: string;
        identifier?: string;
        url?: string;
      };
    };
  };
  errors?: Array<{ message?: string }>;
};

export async function pushIdeaToLinear(
  options: LinearPushOptions,
): Promise<IntegrationPushResponse> {
  const { idea, dryRun = false } = options;

  if (!idea.requirements || !idea.strategy) {
    return {
      target: "linear",
      ideaId: idea.ideaId,
      ok: false,
      dryRun,
      message: "Generate S04 and S05 before pushing to Linear.",
    };
  }

  const apiKey = process.env.LINEAR_API_KEY;
  const teamId = process.env.LINEAR_TEAM_ID;

  const payload = {
    query: `
      mutation CreateBuildCopilotIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            url
          }
        }
      }
    `,
    variables: {
      input: {
        teamId,
        title: `BuildCopilot: ${idea.analysis.problemStatement.slice(0, 120)}`,
        description: buildLinearDescription(idea),
        labelIds: [],
      },
    },
  };

  const missingCredentials = !apiKey || !teamId;
  if (dryRun || missingCredentials) {
    return {
      target: "linear",
      ideaId: idea.ideaId,
      ok: true,
      dryRun: true,
      message: missingCredentials
        ? "Linear credentials missing. Returning dry-run payload preview."
        : "Dry-run mode enabled. Linear payload prepared.",
      payloadPreview: payload,
    };
  }

  const response = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await safeReadText(response);
    return {
      target: "linear",
      ideaId: idea.ideaId,
      ok: false,
      dryRun: false,
      message: `Linear push failed (${response.status}): ${detail}`,
    };
  }

  const data = (await response.json()) as LinearIssueResponse;
  const topError = data.errors?.[0]?.message;
  if (topError) {
    return {
      target: "linear",
      ideaId: idea.ideaId,
      ok: false,
      dryRun: false,
      message: `Linear push failed: ${topError}`,
    };
  }

  const issue = data.data?.issueCreate?.issue;
  const success = Boolean(data.data?.issueCreate?.success);

  return {
    target: "linear",
    ideaId: idea.ideaId,
    ok: success,
    dryRun: false,
    message: success
      ? "Linear issue created successfully."
      : "Linear returned an unsuccessful issue creation response.",
    externalId: issue?.identifier ?? issue?.id,
    url: issue?.url,
  };
}

function buildLinearDescription(idea: IdeaRecord): string {
  const strategy = idea.strategy!;
  const requirements = idea.requirements!;

  const topFr = requirements.frd.functionalRequirements
    .slice(0, 5)
    .map((item) => `- ${item.id}: ${item.text}`)
    .join("\n");

  const metrics = strategy.successMetrics.map((item) => `- ${item}`).join("\n");

  return [
    `Idea ID: ${idea.ideaId}`,
    "",
    `Problem: ${idea.analysis.problemStatement}`,
    "",
    "## Strategy (S04)",
    `Vision: ${strategy.vision}`,
    `Market Position: ${strategy.marketPosition}`,
    `Business Model: ${strategy.businessModel}`,
    "",
    "## Requirements (S05)",
    `PRD: ${requirements.prd.title}`,
    "Top Functional Requirements:",
    topFr,
    "",
    "Success Metrics:",
    metrics,
  ].join("\n");
}

async function safeReadText(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.slice(0, 280);
  } catch {
    return "unknown error";
  }
}
