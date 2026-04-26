import { NextRequest, NextResponse } from "next/server";
import {
  RunDueSyncRequest,
} from "@/lib/buildcopilot-types";
import { runDueScheduledSyncs } from "@/lib/scheduler-runner";

export async function POST(request: NextRequest) {
  try {
    const schedulerSecret = process.env.BUILDCOPILOT_SCHEDULER_SECRET;
    if (schedulerSecret) {
      const headerSecret = request.headers.get("x-buildcopilot-scheduler-secret");
      if (headerSecret !== schedulerSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = (await request.json().catch(() => ({}))) as RunDueSyncRequest;
    const response = await runDueScheduledSyncs(body);

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to run scheduled sync jobs right now." },
      { status: 500 },
    );
  }
}
