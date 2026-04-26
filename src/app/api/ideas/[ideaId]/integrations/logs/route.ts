import { NextResponse } from "next/server";
import { listIntegrationAttempts } from "@/lib/idea-repository";

type Params = {
  params: Promise<{ ideaId: string }>;
};

export async function GET(_: Request, context: Params) {
  try {
    const { ideaId } = await context.params;
    const logs = await listIntegrationAttempts(ideaId);

    if (!logs) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json({ ideaId, items: logs }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unable to load integration logs right now." },
      { status: 500 },
    );
  }
}
