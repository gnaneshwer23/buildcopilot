import { NextRequest, NextResponse } from "next/server";
import {
  BulkExportRequest,
  BulkExportResponse,
} from "@/lib/buildcopilot-types";
import { runWithConcurrency } from "@/lib/async-control";
import { getIdeaById } from "@/lib/idea-repository";
import {
  lookupIdempotentResponse,
  saveIdempotentResponse,
} from "@/lib/idempotency";
import { buildBaseBulkTelemetry, bucketCount } from "@/lib/bulk-telemetry";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BulkExportRequest;
    const idempotencyKey = request.headers.get("x-idempotency-key")?.trim();

    if (idempotencyKey) {
      const existing = await lookupIdempotentResponse({
        scope: "bulk-export",
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

    if (!["markdown", "json", "docx"].includes(body.format)) {
      return NextResponse.json({ error: "format must be markdown, json, or docx" }, { status: 400 });
    }

    const uniqueIdeaIds = Array.from(new Set(body.ideaIds)).slice(0, 200);
    const concurrencyLimit = Math.min(
      Math.max(Number.parseInt(process.env.BUILDCOPILOT_BULK_CONCURRENCY ?? "5", 10) || 5, 1),
      20,
    );
    const startedAt = new Date();

    const tasks = uniqueIdeaIds.map(
      (ideaId) => async (): Promise<BulkExportResponse["items"][number] | null> => {
        const idea = await getIdeaById(ideaId);
        if (!idea) {
          return null;
        }

        const ext = body.format === "markdown" ? "md" : body.format;
        return {
          ideaId,
          format: body.format,
          filename: `buildcopilot-${ideaId}.${ext}`,
          downloadUrl: `/api/ideas/${ideaId}/export?format=${body.format}`,
        };
      },
    );

    const taskResults = await runWithConcurrency(tasks, concurrencyLimit);
    const completedAt = new Date();
    const items = taskResults.filter((item): item is BulkExportResponse["items"][number] => item !== null);

    const missingIdeaCount = uniqueIdeaIds.length - items.length;
    const errorBuckets = bucketCount(
      missingIdeaCount > 0
        ? Array.from({ length: missingIdeaCount }, () => "idea_not_found")
        : [],
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

    const response: BulkExportResponse = {
      total: uniqueIdeaIds.length,
      available: items.length,
      concurrencyLimit,
      telemetry,
      idempotencyKey,
      idempotencyHit: false,
      items,
    };

    if (idempotencyKey) {
      await saveIdempotentResponse({
        scope: "bulk-export",
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
      { error: "Unable to prepare bulk export right now." },
      { status: 500 },
    );
  }
}
