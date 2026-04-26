import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/buildcopilot/assistant/actions/route";

const validSnapshot = () => ({
  ideaText: "Idea",
  captureOutput: null,
  vision: "Vision",
  usp: "USP",
  vp: "VP",
  roadmap: [],
  prdSections: [],
  prdVersion: 1,
  cards: [],
  rows: [],
});

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/buildcopilot/assistant/actions", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/buildcopilot/assistant/actions", () => {
  it("returns 200 for actionId s4 (generate stories)", async () => {
    const req = makePostRequest({ actionId: "s4", snapshot: validSnapshot() });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json() as { message: string; cards?: unknown[] };
    expect(typeof data.message).toBe("string");
    expect(data.message.length).toBeGreaterThan(0);
  });

  it("returns 200 for actionId s5 (summarize sprint)", async () => {
    const req = makePostRequest({ actionId: "s5", snapshot: validSnapshot() });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json() as { message: string; summary?: string };
    expect(typeof data.message).toBe("string");
  });

  it("returns 200 for actionId s6 (detect blockers)", async () => {
    const req = makePostRequest({ actionId: "s6", snapshot: validSnapshot() });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json() as { message: string; blockers?: string[] };
    expect(typeof data.message).toBe("string");
  });

  it("returns 400 for unknown actionId", async () => {
    const req = makePostRequest({ actionId: "s999", snapshot: validSnapshot() });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string; code: string };
    expect(data.code).toBe("invalid_action");
    expect(data.error).toMatch(/unsupported/i);
  });

  it("returns 400 for empty string actionId", async () => {
    const req = makePostRequest({ actionId: "", snapshot: validSnapshot() });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when actionId is missing entirely", async () => {
    const req = makePostRequest({ snapshot: validSnapshot() });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toMatch(/missing/i);
  });

  it("returns 400 when snapshot is missing", async () => {
    const req = makePostRequest({ actionId: "s4" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toMatch(/missing/i);
  });

  it("returns 400 for SQL injection attempt in actionId", async () => {
    const req = makePostRequest({
      actionId: "'; DROP TABLE users; --",
      snapshot: validSnapshot(),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json() as { code: string };
    expect(data.code).toBe("invalid_action");
  });

  it("returns 400 for actionId with path traversal attempt", async () => {
    const req = makePostRequest({ actionId: "../../etc/passwd", snapshot: validSnapshot() });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json() as { code: string };
    expect(data.code).toBe("invalid_action");
  });

  it("response for s4 includes cards array", async () => {
    const snapshot = {
      ...validSnapshot(),
      prdSections: [
        {
          id: "f1",
          title: "Features",
          content: "1. Login\n2. Dashboard",
          open: true,
          improving: false,
          color: "#fff",
        },
      ],
    };
    const req = makePostRequest({ actionId: "s4", snapshot });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json() as { cards?: unknown[] };
    expect(Array.isArray(data.cards)).toBe(true);
  });

  it("response for s6 includes blockers array", async () => {
    const req = makePostRequest({ actionId: "s6", snapshot: validSnapshot() });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json() as { blockers?: unknown[] };
    expect(Array.isArray(data.blockers)).toBe(true);
  });
});
