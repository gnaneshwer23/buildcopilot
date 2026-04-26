import { NextResponse } from "next/server";
import { deleteIdea } from "@/lib/idea-repository";

type Params = { params: Promise<{ ideaId: string }> };

export async function DELETE(_: Request, { params }: Params) {
  const { ideaId } = await params;
  const deleted = await deleteIdea(ideaId);
  if (!deleted) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }
  return NextResponse.json({ deleted: true }, { status: 200 });
}
