import { NextResponse } from "next/server";
import { getIdeaById } from "@/lib/idea-repository";
import { ExportFormat, exportIdeaArtifact } from "@/lib/idea-exporters";

type Params = {
  params: Promise<{ ideaId: string }>;
};

const validFormats: ExportFormat[] = ["markdown", "json", "docx"];

export async function GET(request: Request, context: Params) {
  try {
    const { ideaId } = await context.params;
    const idea = await getIdeaById(ideaId);

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const formatQuery = url.searchParams.get("format") ?? "markdown";
    const format = validFormats.find((item) => item === formatQuery);

    if (!format) {
      return NextResponse.json(
        { error: "Unsupported format. Use markdown, json, or docx." },
        { status: 400 },
      );
    }

    const artifact = await exportIdeaArtifact(idea, format);
    const filename = `buildcopilot-${idea.ideaId}.${artifact.extension}`;
    const body =
      typeof artifact.content === "string"
        ? artifact.content
        : new Uint8Array(artifact.content);

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": artifact.contentType,
        "Content-Disposition": `attachment; filename=\"${filename}\"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to export idea artifact right now." },
      { status: 500 },
    );
  }
}
