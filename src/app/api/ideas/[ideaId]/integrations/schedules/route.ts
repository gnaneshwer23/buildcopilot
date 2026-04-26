import { NextRequest, NextResponse } from "next/server";
import {
  UpsertScheduledSyncRequest,
} from "@/lib/buildcopilot-types";
import {
  listScheduledSyncJobs,
  upsertScheduledSyncJob,
} from "@/lib/idea-repository";

type Params = {
  params: Promise<{ ideaId: string }>;
};

export async function GET(_: Request, context: Params) {
  try {
    const { ideaId } = await context.params;
    const jobs = await listScheduledSyncJobs(ideaId);

    if (!jobs) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json({ ideaId, items: jobs }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to load schedules right now." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, context: Params) {
  try {
    const { ideaId } = await context.params;
    const body = (await request.json()) as UpsertScheduledSyncRequest;

    if (!body.target) {
      return NextResponse.json({ error: "target is required" }, { status: 400 });
    }

    if (!body.intervalMinutes || body.intervalMinutes < 1) {
      return NextResponse.json(
        { error: "intervalMinutes must be >= 1" },
        { status: 400 },
      );
    }

    const job = await upsertScheduledSyncJob(ideaId, {
      target: body.target,
      intervalMinutes: Math.floor(body.intervalMinutes),
      dryRun: body.dryRun ?? false,
      enabled: body.enabled ?? true,
    });

    if (!job) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json({ ideaId, job }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to save schedule right now." },
      { status: 500 },
    );
  }
}
