import { NextResponse } from "next/server";
import { generateRequirementsPack } from "@/lib/requirements-generator";
import {
  getIdeaById,
  saveIdeaRequirements,
  updateIdeaRequirements,
} from "@/lib/idea-repository";
import { UpdateRequirementsRequest } from "@/lib/buildcopilot-types";

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

    const requirements = await generateRequirementsPack(idea);
    const updated = await saveIdeaRequirements(ideaId, requirements);

    if (!updated) {
      return NextResponse.json({ error: "Unable to persist requirements" }, { status: 500 });
    }

    return NextResponse.json({ ideaId, requirements }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unable to generate requirements right now.";
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
    const body = (await request.json()) as UpdateRequirementsRequest;

    const updated = await updateIdeaRequirements(ideaId, (current) => {
      const functionalRequirements = [...current.frd.functionalRequirements];
      if (body.topFunctionalRequirementText?.trim() && functionalRequirements[0]) {
        functionalRequirements[0] = {
          ...functionalRequirements[0],
          text: body.topFunctionalRequirementText.trim(),
        };
      }

      return {
        ...current,
        generatedAt: new Date().toISOString(),
        prd: {
          ...current.prd,
          title: body.prdTitle?.trim() || current.prd.title,
        },
        brd: {
          ...current.brd,
          businessCase: body.businessCase?.trim() || current.brd.businessCase,
        },
        frd: {
          ...current.frd,
          functionalRequirements,
        },
      };
    });

    if (!updated || !updated.requirements) {
      return NextResponse.json(
        { error: "Requirements not found for this idea" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { ideaId, requirements: updated.requirements },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to update requirements right now." },
      { status: 500 },
    );
  }
}
