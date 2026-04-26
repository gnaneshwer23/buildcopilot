import {
  IntegrationActorRole,
  IntegrationPolicyConfig,
  IntegrationTarget,
  PolicySimulationResponse,
} from "@/lib/buildcopilot-types";

export const POLICY_TARGETS: IntegrationTarget[] = ["jira", "confluence", "linear"];
export const POLICY_ACTOR_ROLES: IntegrationActorRole[] = [
  "Product Manager",
  "Business Analyst",
  "Sponsor",
  "System",
];

const DEFAULT_POLICY: Required<IntegrationPolicyConfig> = {
  environments: {
    development: POLICY_TARGETS,
    test: POLICY_TARGETS,
    production: POLICY_TARGETS,
    staging: POLICY_TARGETS,
  },
  roles: {
    "Product Manager": POLICY_TARGETS,
    "Business Analyst": POLICY_TARGETS,
    Sponsor: POLICY_TARGETS,
    System: POLICY_TARGETS,
  },
};

export function getCurrentIntegrationEnvironment(): string {
  return (
    process.env.BUILDCOPILOT_DEPLOYMENT_ENV?.trim().toLowerCase() ||
    process.env.NODE_ENV?.trim().toLowerCase() ||
    "development"
  );
}

export function getIntegrationPolicy(): Required<IntegrationPolicyConfig> {
  const raw = process.env.BUILDCOPILOT_INTEGRATION_POLICY_JSON;
  if (!raw) {
    return DEFAULT_POLICY;
  }

  try {
    const parsed = JSON.parse(raw) as IntegrationPolicyConfig;
    return {
      environments: {
        ...DEFAULT_POLICY.environments,
        ...(parsed.environments ?? {}),
      },
      roles: {
        ...DEFAULT_POLICY.roles,
        ...(parsed.roles ?? {}),
      },
    };
  } catch {
    return DEFAULT_POLICY;
  }
}

export function evaluateIntegrationPolicy(input: {
  environment: string;
  actorRole: IntegrationActorRole;
  target: IntegrationTarget;
}): { allowed: boolean; reason?: string } {
  const policy = getIntegrationPolicy();
  const envAllowed = policy.environments[input.environment] ?? POLICY_TARGETS;
  const roleAllowed = policy.roles[input.actorRole] ?? POLICY_TARGETS;

  if (!envAllowed.includes(input.target)) {
    return {
      allowed: false,
      reason: `Target ${input.target} is blocked in environment ${input.environment}.`,
    };
  }

  if (!roleAllowed.includes(input.target)) {
    return {
      allowed: false,
      reason: `Role ${input.actorRole} is not allowed to push ${input.target}.`,
    };
  }

  return { allowed: true };
}

export function simulateIntegrationPolicy(input: {
  environment: string;
  actorRoles: IntegrationActorRole[];
  targets: IntegrationTarget[];
}): PolicySimulationResponse {
  const roles = input.actorRoles.length > 0 ? input.actorRoles : POLICY_ACTOR_ROLES;
  const targets = input.targets.length > 0 ? input.targets : POLICY_TARGETS;
  const results: PolicySimulationResponse["results"] = [];

  for (const actorRole of roles) {
    for (const target of targets) {
      const evaluation = evaluateIntegrationPolicy({
        environment: input.environment,
        actorRole,
        target,
      });

      results.push({
        actorRole,
        target,
        allowed: evaluation.allowed,
        reason: evaluation.reason,
      });
    }
  }

  return {
    environment: input.environment,
    activePolicy: getIntegrationPolicy(),
    results,
  };
}
