import { NextResponse } from "next/server";
import { getPersistenceHealth } from "@/lib/persistence";

export async function GET() {
  try {
    const health = await getPersistenceHealth();
    const status = health.connected || health.mode === "file" ? 200 : 503;
    return NextResponse.json(health, { status });
  } catch {
    return NextResponse.json(
      {
        mode: "file",
        configured: false,
        connected: false,
        usingFallback: true,
        reason: "Unexpected persistence health failure",
      },
      { status: 500 },
    );
  }
}
