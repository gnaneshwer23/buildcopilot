import {
  IdeaRecord,
  IntegrationPushResponse,
} from "@/lib/buildcopilot-types";

type ConfluencePushOptions = {
  idea: IdeaRecord;
  dryRun?: boolean;
};

export async function pushIdeaToConfluence(
  options: ConfluencePushOptions,
): Promise<IntegrationPushResponse> {
  const { idea, dryRun = false } = options;

  if (!idea.requirements || !idea.strategy) {
    return {
      target: "confluence",
      ideaId: idea.ideaId,
      ok: false,
      dryRun,
      message: "Generate S04 and S05 before pushing to Confluence.",
    };
  }

  const baseUrl = process.env.CONFLUENCE_BASE_URL;
  const email = process.env.CONFLUENCE_EMAIL;
  const token = process.env.CONFLUENCE_API_TOKEN;
  const spaceKey = process.env.CONFLUENCE_SPACE_KEY;

  const pageBody = toStorageFormat(idea);
  const payload = {
    type: "page",
    title: `BuildCopilot ${idea.ideaId} - Strategy and Requirements`,
    space: { key: spaceKey || "BUILD" },
    body: {
      storage: {
        value: pageBody,
        representation: "storage",
      },
    },
  };

  const missingCredentials = !baseUrl || !email || !token || !spaceKey;
  if (dryRun || missingCredentials) {
    return {
      target: "confluence",
      ideaId: idea.ideaId,
      ok: true,
      dryRun: true,
      message: missingCredentials
        ? "Confluence credentials missing. Returning dry-run payload preview."
        : "Dry-run mode enabled. Confluence payload prepared.",
      payloadPreview: payload,
    };
  }

  const response = await fetch(`${baseUrl}/wiki/rest/api/content`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await safeReadText(response);
    return {
      target: "confluence",
      ideaId: idea.ideaId,
      ok: false,
      dryRun: false,
      message: `Confluence push failed (${response.status}): ${detail}`,
    };
  }

  const data = (await response.json()) as { id?: string; _links?: { webui?: string } };

  return {
    target: "confluence",
    ideaId: idea.ideaId,
    ok: true,
    dryRun: false,
    message: "Confluence page created successfully.",
    externalId: data.id,
    url: data._links?.webui ? `${baseUrl}${data._links.webui}` : undefined,
  };
}

function toStorageFormat(idea: IdeaRecord): string {
  const strategy = idea.strategy!;
  const requirements = idea.requirements!;

  const functionalList = requirements.frd.functionalRequirements
    .map((fr) => `<li><strong>${fr.id}</strong>: ${escapeHtml(fr.text)}</li>`)
    .join("");

  const nfrList = requirements.frd.nonFunctionalRequirements
    .map((nfr) => `<li><strong>${nfr.id}</strong> (${escapeHtml(nfr.category)}): ${escapeHtml(nfr.text)}</li>`)
    .join("");

  return `
<h1>BuildCopilot Delivery Artifact</h1>
<p><strong>Idea ID:</strong> ${escapeHtml(idea.ideaId)}</p>
<p><strong>Problem:</strong> ${escapeHtml(idea.analysis.problemStatement)}</p>
<h2>Strategy (S04)</h2>
<p><strong>Vision:</strong> ${escapeHtml(strategy.vision)}</p>
<p><strong>Market Position:</strong> ${escapeHtml(strategy.marketPosition)}</p>
<p><strong>Business Model:</strong> ${escapeHtml(strategy.businessModel)}</p>
<h2>Requirements (S05)</h2>
<p><strong>PRD Title:</strong> ${escapeHtml(requirements.prd.title)}</p>
<p><strong>Business Case:</strong> ${escapeHtml(requirements.brd.businessCase)}</p>
<h3>Functional Requirements</h3>
<ul>${functionalList}</ul>
<h3>Non-Functional Requirements</h3>
<ul>${nfrList}</ul>
`.trim();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function safeReadText(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.slice(0, 280);
  } catch {
    return "unknown error";
  }
}
