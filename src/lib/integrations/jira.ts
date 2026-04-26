import {
  IdeaRecord,
  IntegrationPushResponse,
} from "@/lib/buildcopilot-types";

type JiraPushOptions = {
  idea: IdeaRecord;
  dryRun?: boolean;
};

export async function pushIdeaToJira(
  options: JiraPushOptions,
): Promise<IntegrationPushResponse> {
  const { idea, dryRun = false } = options;

  if (!idea.requirements || !idea.strategy) {
    return {
      target: "jira",
      ideaId: idea.ideaId,
      ok: false,
      dryRun,
      message: "Generate S04 and S05 before pushing to Jira.",
    };
  }

  const baseUrl = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  const projectKey = process.env.JIRA_PROJECT_KEY;

  const issuePayload = {
    fields: {
      project: { key: projectKey || "BUILD" },
      summary: `BuildCopilot: ${idea.analysis.problemStatement.slice(0, 90)}`,
      issuetype: { name: "Epic" },
      description: {
        type: "doc",
        version: 1,
        content: [
          paragraph(`Idea ID: ${idea.ideaId}`),
          paragraph(`Vision: ${idea.strategy.vision}`),
          paragraph(`PRD: ${idea.requirements.prd.title}`),
          bullet(idea.requirements.frd.functionalRequirements.slice(0, 3).map((fr) => fr.text)),
        ],
      },
      labels: ["buildcopilot", "execution-intelligence", "ai-generated"],
    },
  };

  const missingCredentials = !baseUrl || !email || !token || !projectKey;
  if (dryRun || missingCredentials) {
    return {
      target: "jira",
      ideaId: idea.ideaId,
      ok: true,
      dryRun: true,
      message: missingCredentials
        ? "Jira credentials missing. Returning dry-run payload preview."
        : "Dry-run mode enabled. Jira payload prepared.",
      payloadPreview: issuePayload,
    };
  }

  const response = await fetch(`${baseUrl}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(issuePayload),
  });

  if (!response.ok) {
    const detail = await safeReadText(response);
    return {
      target: "jira",
      ideaId: idea.ideaId,
      ok: false,
      dryRun: false,
      message: `Jira push failed (${response.status}): ${detail}`,
    };
  }

  const data = (await response.json()) as { key?: string; self?: string };

  return {
    target: "jira",
    ideaId: idea.ideaId,
    ok: true,
    dryRun: false,
    message: "Jira issue created successfully.",
    externalId: data.key,
    url: data.self,
  };
}

function paragraph(text: string) {
  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  };
}

function bullet(items: string[]) {
  return {
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [paragraph(item)],
    })),
  };
}

async function safeReadText(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.slice(0, 280);
  } catch {
    return "unknown error";
  }
}
