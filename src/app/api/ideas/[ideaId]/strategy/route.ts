import { NextResponse } from "next/server";
import { generateProductStrategy } from "@/lib/strategy-generator";
import {
  getIdeaById,
  saveIdeaStrategy,
  updateIdeaStrategy,
} from "@/lib/idea-repository";
import { UpdateStrategyRequest } from "@/lib/buildcopilot-types";

type Params = {
  params: Promise<{ ideaId: string }>;
};

export async function POST(_: Request, context: Params) {
  try {
    const { ideaId } = await context.params;
    const idea = await getIdeaById(ideaId);

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const strategy = await generateProductStrategy(idea);
    const updated = await saveIdeaStrategy(ideaId, strategy);

    if (!updated) {
      return NextResponse.json({ error: "Unable to persist strategy" }, { status: 500 });
    }

    return NextResponse.json({ ideaId, strategy }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unable to generate strategy right now.";
    const isKeyError = msg.includes("ANTHROPIC_API_KEY");
    return NextResponse.json(
      { error: isKeyError ? "AI not configured — add ANTHROPIC_API_KEY to .env.local." : msg },
      { status: isKeyError ? 503 : 500 },
    );
  }
}

export async function PUT(request: Request, context: Params) {
  try {
    const { ideaId } = await context.params;
    const body = (await request.json()) as UpdateStrategyRequest;

    const updated = await updateIdeaStrategy(ideaId, (current) => ({
      ...current,
      vision: body.vision?.trim() || current.vision,
      marketPosition: body.marketPosition?.trim() || current.marketPosition,
      businessModel: body.businessModel?.trim() || current.businessModel,
      mvpScope: body.mvpScope?.length ? body.mvpScope : current.mvpScope,
      nonGoals: body.nonGoals?.length ? body.nonGoals : current.nonGoals,
      successMetrics: body.successMetrics?.length
        ? body.successMetrics
        : current.successMetrics,
      generatedAt: new Date().toISOString(),
    }));

    if (!updated || !updated.strategy) {
      return NextResponse.json(
        { error: "Strategy not found for this idea" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ideaId, strategy: updated.strategy }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to update strategy right now." },
      { status: 500 },
    );
  }
}
