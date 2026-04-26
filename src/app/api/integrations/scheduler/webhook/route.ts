import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { RunDueSyncRequest } from "@/lib/buildcopilot-types";
import { runDueScheduledSyncs } from "@/lib/scheduler-runner";
import { registerSchedulerWebhookReplay } from "@/lib/webhook-replay-guard";

const TIMESTAMP_HEADER = "x-buildcopilot-webhook-timestamp";
const SIGNATURE_HEADER = "x-buildcopilot-webhook-signature";

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.BUILDCOPILOT_SCHEDULER_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Webhook secret is not configured." },
        { status: 500 },
      );
    }

    const timestamp = request.headers.get(TIMESTAMP_HEADER);
    const signature = request.headers.get(SIGNATURE_HEADER);

    if (!timestamp || !signature) {
      return NextResponse.json(
        { error: `Missing ${TIMESTAMP_HEADER} or ${SIGNATURE_HEADER} header.` },
        { status: 400 },
      );
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const sentSeconds = Number.parseInt(timestamp, 10);
    if (!Number.isFinite(sentSeconds)) {
      return NextResponse.json({ error: "Invalid timestamp header." }, { status: 400 });
    }

    const toleranceSeconds = Math.max(
      Number.parseInt(process.env.BUILDCOPILOT_SCHEDULER_WEBHOOK_TOLERANCE_SECONDS ?? "300", 10) || 300,
      30,
    );
    if (Math.abs(nowSeconds - sentSeconds) > toleranceSeconds) {
      return NextResponse.json(
        { error: "Webhook timestamp outside allowed tolerance window." },
        { status: 401 },
      );
    }

    const rawBody = await request.text();
    const expected = createHmac("sha256", secret)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    if (!constantTimeEqual(signature, expected)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    const replayCheck = await registerSchedulerWebhookReplay(signature, sentSeconds);
    if (!replayCheck.ok) {
      return NextResponse.json(
        { error: replayCheck.reason },
        { status: replayCheck.status },
      );
    }

    const body = rawBody.trim().length === 0
      ? {}
      : (JSON.parse(rawBody) as RunDueSyncRequest);

    const response = await runDueScheduledSyncs(body);
    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to process scheduler webhook trigger." },
      { status: 500 },
    );
  }
}

function constantTimeEqual(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}
