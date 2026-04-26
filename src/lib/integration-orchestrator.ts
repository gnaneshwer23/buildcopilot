import {
  IntegrationActorRole,
  IntegrationPushResponse,
  IntegrationTarget,
} from "@/lib/buildcopilot-types";
import {
  appendIntegrationAttempt,
  getIdeaById,
  listIntegrationAttempts,
} from "@/lib/idea-repository";
import { pushIdeaToJira } from "@/lib/integrations/jira";
import { pushIdeaToConfluence } from "@/lib/integrations/confluence";
import { pushIdeaToLinear } from "@/lib/integrations/linear";
import {
  evaluateIntegrationPolicy,
  getCurrentIntegrationEnvironment,
} from "@/lib/integration-policy";

type RunIntegrationPushInput = {
  ideaId: string;
  target: IntegrationTarget;
  dryRun: boolean;
  previousAttemptId?: string;
  actorRole?: IntegrationActorRole;
};

export async function runIntegrationPush(
  input: RunIntegrationPushInput,
): Promise<IntegrationPushResponse | null> {
  const { ideaId, target, dryRun, previousAttemptId } = input;
  const idea = await getIdeaById(ideaId);
  if (!idea) {
    return null;
  }

  const actorRole: IntegrationActorRole =
    input.actorRole ?? idea.latestReview?.role ?? "Product Manager";
  const environment = getCurrentIntegrationEnvironment();
  const policy = evaluateIntegrationPolicy({
    environment,
    actorRole,
    target,
  });

  if (!policy.allowed) {
    const attempts = (await listIntegrationAttempts(ideaId)) ?? [];
    const retryCount = previousAttemptId
      ? ((attempts.find((item) => item.attemptId === previousAttemptId)?.retryCount ?? 0) + 1)
      : 0;

    const blockedMessage = `Policy blocked integration: ${policy.reason ?? "unknown reason."}`;
    const attempt = await appendIntegrationAttempt(ideaId, {
      target,
      dryRun,
      ok: false,
      message: blockedMessage,
      retryCount,
      previousAttemptId,
    });

    return {
      target,
      ideaId,
      ok: false,
      dryRun,
      message: blockedMessage,
      attemptId: attempt?.attemptId,
      retryCount,
      previousAttemptId,
      policyBlocked: true,
      policyContext: {
        environment,
        actorRole,
      },
    };
  }

  let result: IntegrationPushResponse;
  if (target === "jira") {
    result = await pushIdeaToJira({ idea, dryRun });
  } else if (target === "confluence") {
    result = await pushIdeaToConfluence({ idea, dryRun });
  } else {
    result = await pushIdeaToLinear({ idea, dryRun });
  }

  const attempts = (await listIntegrationAttempts(ideaId)) ?? [];
  const retryCount = previousAttemptId
    ? ((attempts.find((item) => item.attemptId === previousAttemptId)?.retryCount ?? 0) + 1)
    : 0;

  const attempt = await appendIntegrationAttempt(ideaId, {
    target,
    dryRun,
    ok: result.ok,
    message: result.message,
    externalId: result.externalId,
    url: result.url,
    retryCount,
    previousAttemptId,
  });

  return {
    ...result,
    attemptId: attempt?.attemptId,
    retryCount,
    previousAttemptId,
    policyContext: {
      environment,
      actorRole,
    },
  };
}
