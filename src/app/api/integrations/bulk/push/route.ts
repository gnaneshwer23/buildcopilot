import { NextRequest, NextResponse } from "next/server";
import {
  BulkPushRequest,
  BulkPushResponse,
} from "@/lib/buildcopilot-types";
import { runWithConcurrency } from "@/lib/async-control";
import {
  lookupIdempotentResponse,
  saveIdempotentResponse,
} from "@/lib/idempotency";
import { buildBaseBulkTelemetry, bucketCount } from "@/lib/bulk-telemetry";
import { runIntegrationPush } from "@/lib/integration-orchestrator";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BulkPushRequest;
    const idempotencyKey = request.headers.get("x-idempotency-key")?.trim();

    if (idempotencyKey) {
      const existing = await lookupIdempotentResponse({
        scope: "bulk-push",
        idempotencyKey,
        requestBody: body,
      });

      if (existing.state === "conflict") {
        return NextResponse.json(
          { error: "Idempotency key already used with a different payload." },
          { status: 409 },
        );
      }

      if (existing.state === "hit") {
        const response = NextResponse.json(existing.body, { status: existing.status });
        response.headers.set("x-idempotency-hit", "true");
        response.headers.set("x-idempotency-key", idempotencyKey);
        return response;
      }
    }

    if (!Array.isArray(body.ideaIds) || body.ideaIds.length === 0) {
      return NextResponse.json({ error: "ideaIds must be a non-empty array" }, { status: 400 });
    }

    if (!Array.isArray(body.targets) || body.targets.length === 0) {
      return NextResponse.json({ error: "targets must be a non-empty array" }, { status: 400 });
    }

    const uniqueIdeaIds = Array.from(new Set(body.ideaIds)).slice(0, 100);
    const uniqueTargets = Array.from(new Set(body.targets)).slice(0, 3);
    const concurrencyLimit = Math.min(
      Math.max(Number.parseInt(process.env.BUILDCOPILOT_BULK_CONCURRENCY ?? "5", 10) || 5, 1),
      20,
    );
    const startedAt = new Date();

    const tasks: Array<() => Promise<BulkPushResponse["results"][number]>> = [];
    for (const ideaId of uniqueIdeaIds) {
      for (const target of uniqueTargets) {
        tasks.push(async () => {
        const result = await runIntegrationPush({
          ideaId,
          target,
          dryRun: body.dryRun ?? false,
          actorRole: body.actorRole,
        });

        if (!result) {
          return {
            ideaId,
            target,
            ok: false,
            dryRun: body.dryRun ?? false,
            message: "Idea not found.",
          };
        }

        return {
          ...result,
          ideaId,
          target,
        };
        });
      }
    }

    const results = await runWithConcurrency(tasks, concurrencyLimit);
    const completedAt = new Date();

    const errorBuckets = bucketCount(
      results
        .filter((item) => !item.ok)
        .map((item) => {
          if (item.message.toLowerCase().includes("not found")) {
            return "idea_not_found";
          }

          if (item.policyBlocked) {
            return "policy_blocked";
          }

          return "integration_failed";
        }),
    );

    const telemetry = {
      ...buildBaseBulkTelemetry({
        startedAt,
        completedAt,
        totalTasks: tasks.length,
        concurrencyLimit,
      }),
      errorBuckets,
    };

    const response: BulkPushResponse = {
      total: results.length,
      successful: results.filter((item) => item.ok).length,
      concurrencyLimit,
      telemetry,
      idempotencyKey,
      idempotencyHit: false,
      results,
    };

    if (idempotencyKey) {
      await saveIdempotentResponse({
        scope: "bulk-push",
        idempotencyKey,
        requestBody: body,
        status: 200,
        body: response,
      });
    }

    const nextResponse = NextResponse.json(response, { status: 200 });
    if (idempotencyKey) {
      nextResponse.headers.set("x-idempotency-hit", "false");
      nextResponse.headers.set("x-idempotency-key", idempotencyKey);
    }

    return nextResponse;
  } catch {
    return NextResponse.json(
      { error: "Unable to run bulk push right now." },
      { status: 500 },
    );
  }
}
