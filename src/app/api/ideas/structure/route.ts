import { NextRequest, NextResponse } from "next/server";
import { structureIdea } from "@/lib/idea-structuring";
import { StructuringRequest } from "@/lib/buildcopilot-types";
import { saveStructuredIdea } from "@/lib/idea-repository";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as StructuringRequest;

    if (!body.rawIdea || body.rawIdea.trim().length < 24) {
      return NextResponse.json(
        { error: "Please provide a clearer idea description (minimum 24 characters)." },
        { status: 400 },
      );
    }

    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;

    const response = await structureIdea(body);
    await saveStructuredIdea(
      response,
      body.rawIdea.trim(),
      (body.clarifications ?? []).map((entry) => entry.trim()).filter(Boolean),
      userId,
    );

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unable to process this idea right now.";
    const isKeyError = msg.includes("ANTHROPIC_API_KEY");
    return NextResponse.json(
      { error: isKeyError ? "AI not configured — add ANTHROPIC_API_KEY to .env.local." : msg },
      { status: isKeyError ? 503 : 500 },
    );
  }
}
