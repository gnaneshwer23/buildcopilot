import { NextResponse } from "next/server";
import { collectSchedulerObservability } from "@/lib/scheduler-observability";

export async function GET() {
  try {
    const metrics = await collectSchedulerObservability();
    return NextResponse.json(metrics, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to load scheduler metrics right now." },
      { status: 500 },
    );
  }
}
