import { NextRequest, NextResponse } from "next/server";
import { updateStoryStatus } from "@/lib/idea-repository";
import { StoryStatus } from "@/lib/buildcopilot-types";

const VALID_STATUSES: StoryStatus[] = ["todo", "in_progress", "done"];

type Params = { params: Promise<{ ideaId: string; storyId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { ideaId, storyId } = await params;

  try {
    const body = (await request.json()) as { status: StoryStatus };

    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 },
      );
    }

    const updated = await updateStoryStatus(ideaId, storyId, body.status);
    if (!updated) {
      return NextResponse.json({ error: "Idea or story not found" }, { status: 404 });
    }

    return NextResponse.json({ ideaId, storyId, status: body.status }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to update story status." }, { status: 500 });
  }
}
