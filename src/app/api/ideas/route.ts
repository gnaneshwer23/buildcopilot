import { NextResponse } from "next/server";
import { listIdeas } from "@/lib/idea-repository";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const data = await listIdeas(userId);
  return NextResponse.json(data, { status: 200 });
}
