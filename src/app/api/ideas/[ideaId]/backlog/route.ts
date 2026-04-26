import { NextRequest, NextResponse } from "next/server";
import { getIdeaById, saveIdeaBacklog } from "@/lib/idea-repository";
import { generateBacklogPack } from "@/lib/backlog-generator";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ideaId: string }> },
) {
  const { ideaId } = await params;

  try {
    const idea = await getIdeaById(ideaId);

    if (!idea || !idea.requirements) {
      return NextResponse.json(
        { error: "Requirements not found. Please generate them first." },
        { status: 404 },
      );
    }

    const backlog = await generateBacklogPack(idea.requirements, {
      rawIdea: idea.rawIdea,
      vision: idea.strategy?.vision,
    });
    await saveIdeaBacklog(ideaId, backlog);

    return NextResponse.json(backlog, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unable to generate backlog.";
    const isKeyError = msg.includes("ANTHROPIC_API_KEY");
    return NextResponse.json(
      { error: isKeyError ? "AI not configured — add ANTHROPIC_API_KEY to .env.local." : msg },
      { status: isKeyError ? 503 : 500 },
    );
  }
}
