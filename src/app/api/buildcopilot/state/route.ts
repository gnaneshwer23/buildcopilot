import { NextRequest, NextResponse } from "next/server";
import { getBuildCopilotState, saveBuildCopilotState, isValidSnapshotShape } from "@/lib/buildcopilot-state";
import { normalizeBuildCopilotSnapshot } from "@/lib/buildcopilot-snapshot-normalization";
import type { BuildCopilotSnapshot } from "@/lib/buildcopilot-types";

const MAX_STATE_BYTES = 512 * 1024; // 512 KB

export async function GET() {
  try {
    const snapshot = await getBuildCopilotState();

    if (!snapshot) {
      return NextResponse.json({ state: null }, { status: 200 });
    }

    const normalizedState = normalizeBuildCopilotSnapshot(snapshot.state as BuildCopilotSnapshot);
    return NextResponse.json({ ...snapshot, state: normalizedState }, { status: 200 });
  } catch (error) {
    console.error("[buildcopilot/state GET] Failed to load state:", error);
    return NextResponse.json(
      { error: "Unable to load BuildCopilot state." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const rawText = await request.text();

    if (Buffer.byteLength(rawText, "utf8") > MAX_STATE_BYTES) {
      console.warn("[buildcopilot/state PUT] Payload too large:", rawText.length, "chars");
      return NextResponse.json(
        { error: "Payload too large. Maximum snapshot size is 512 KB.", code: "payload_too_large" },
        { status: 413 },
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(rawText) as unknown;
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    if (
      !body ||
      typeof body !== "object" ||
      !("state" in (body as Record<string, unknown>))
    ) {
      return NextResponse.json({ error: "Missing state payload." }, { status: 400 });
    }

    const { state } = body as { state: unknown };

    if (!isValidSnapshotShape(state)) {
      console.warn("[buildcopilot/state PUT] Rejected malformed snapshot shape");
      return NextResponse.json(
        { error: "Invalid snapshot shape.", code: "invalid_snapshot" },
        { status: 422 },
      );
    }

    const normalizedState = normalizeBuildCopilotSnapshot(state as BuildCopilotSnapshot);
    const saved = await saveBuildCopilotState(normalizedState);
    console.info("[buildcopilot/state PUT] Snapshot saved at", saved.updatedAt);
    return NextResponse.json(saved, { status: 200 });
  } catch (error) {
    console.error("[buildcopilot/state PUT] Failed to save state:", error);
    return NextResponse.json(
      { error: "Unable to save BuildCopilot state." },
      { status: 500 },
    );
  }
}
