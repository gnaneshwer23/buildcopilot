import { NextResponse } from "next/server";
import { getReplayLedgerMetrics } from "@/lib/persistence";

export async function GET() {
  try {
    const metrics = await getReplayLedgerMetrics();
    return NextResponse.json(metrics, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to collect webhook replay metrics." },
      { status: 500 },
    );
  }
}
