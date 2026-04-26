import { NextRequest, NextResponse } from "next/server";
import { ApproveIdeaRequest } from "@/lib/buildcopilot-types";
import { reviewIdea } from "@/lib/idea-repository";

type Params = {
  params: Promise<{ ideaId: string }>;
};

export async function POST(request: NextRequest, context: Params) {
  try {
    const { ideaId } = await context.params;
    const body = (await request.json()) as ApproveIdeaRequest;

    if (!body.role || !body.decision) {
      return NextResponse.json(
        { error: "role and decision are required" },
        { status: 400 },
      );
    }

    const updated = await reviewIdea(ideaId, body);
    if (!updated) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to save review right now." },
      { status: 500 },
    );
  }
}
