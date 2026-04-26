import { NextResponse } from "next/server";
import { getIdeaHistory } from "@/lib/idea-repository";

type Params = {
  params: Promise<{ ideaId: string }>;
};

export async function GET(_: Request, context: Params) {
  try {
    const { ideaId } = await context.params;
    const history = await getIdeaHistory(ideaId);

    if (!history) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json(history, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to load idea history right now." },
      { status: 500 },
    );
  }
}
