import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the lib module — fs calls must not run in tests
vi.mock("@/lib/buildcopilot-state", async () => {
  const actual = await vi.importActual<typeof import("@/lib/buildcopilot-state")>(
    "@/lib/buildcopilot-state",
  );
  return {
    ...actual,
    // isValidSnapshotShape is NOT mocked — we test the real function through the route
    getBuildCopilotState: vi.fn(),
    saveBuildCopilotState: vi.fn(),
  };
});

import { getBuildCopilotState, saveBuildCopilotState } from "@/lib/buildcopilot-state";
import { GET, PUT } from "@/app/api/buildcopilot/state/route";

const validSnapshot = () => ({
  ideaText: "Idea",
  captureOutput: null,
  vision: "Vision",
  usp: "USP",
  vp: "VP",
  roadmap: [{ id: "r1", text: "Launch MVP", column: "now" }],
  prdSections: [
    {
      id: "p1",
      title: "Problem",
      content: "Delivery context drift",
      open: true,
      improving: false,
      color: "blue",
    },
  ],
  cards: [
    {
      id: "k1",
      title: "Capture form",
      epic: "Capture",
      priority: "high",
      estimate: 3,
      assignee: "AK",
      column: "done",
      acceptance: ["Structured output"],
    },
  ],
  rows: [
    {
      id: "t1",
      requirement: "REQ-001",
      epic: "Capture",
      story: "Capture form",
      commit: null,
      testCase: null,
      status: "missing",
      expanded: false,
    },
  ],
  prdVersion: 1,
});

function makeRequest(body: unknown, overrideText?: string): NextRequest {
  const text = overrideText ?? JSON.stringify(body);
  return new NextRequest("http://localhost/api/buildcopilot/state", {
    method: "PUT",
    body: text,
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/buildcopilot/state", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 with snapshot when state exists", async () => {
    const envelope = { updatedAt: "2026-01-01T00:00:00.000Z", state: validSnapshot() };
    vi.mocked(getBuildCopilotState).mockResolvedValue(envelope);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json() as typeof envelope;
    expect(data.updatedAt).toBe(envelope.updatedAt);
  });

  it("normalizes legacy rows in GET response", async () => {
    const legacyState = validSnapshot();
    legacyState.rows = [{ ...legacyState.rows[0], linkedCardId: undefined }];
    const envelope = { updatedAt: "2026-01-01T00:00:00.000Z", state: legacyState };
    vi.mocked(getBuildCopilotState).mockResolvedValue(envelope);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json() as { state: { rows: Array<{ linkedCardId?: string | null }> } };
    expect(data.state.rows[0]?.linkedCardId).toBe("k1");
  });

  it("returns 200 with state:null when no snapshot exists", async () => {
    vi.mocked(getBuildCopilotState).mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json() as { state: null };
    expect(data.state).toBeNull();
  });

  it("returns 500 when getBuildCopilotState throws", async () => {
    vi.mocked(getBuildCopilotState).mockRejectedValue(new Error("disk error"));

    const res = await GET();
    expect(res.status).toBe(500);
    const data = await res.json() as { error: string };
    expect(data.error).toMatch(/unable to load/i);
  });
});

describe("PUT /api/buildcopilot/state", () => {
  beforeEach(() => vi.clearAllMocks());

  it("round-trips legacy state through GET -> PUT with normalized row links", async () => {
    const legacyState = validSnapshot();
    legacyState.rows = [{ ...legacyState.rows[0], linkedCardId: undefined }];

    vi.mocked(getBuildCopilotState).mockResolvedValue({
      updatedAt: "2026-04-25T10:00:00.000Z",
      state: legacyState,
    });

    vi.mocked(saveBuildCopilotState).mockImplementation(async (state) => ({
      updatedAt: "2026-04-25T10:05:00.000Z",
      state,
    }));

    const getRes = await GET();
    expect(getRes.status).toBe(200);
    const getPayload = await getRes.json() as {
      state: { rows: Array<{ linkedCardId?: string | null }> };
    };
    expect(getPayload.state.rows[0]?.linkedCardId).toBe("k1");

    const putRes = await PUT(makeRequest({ state: getPayload.state }));
    expect(putRes.status).toBe(200);

    expect(saveBuildCopilotState).toHaveBeenCalledOnce();
    const savedState = vi.mocked(saveBuildCopilotState).mock.calls[0]?.[0] as {
      rows: Array<{ linkedCardId?: string | null }>;
    };
    expect(savedState.rows[0]?.linkedCardId).toBe("k1");
  });

  it("returns 200 and saves valid snapshot", async () => {
    const savedEnvelope = { updatedAt: "2026-04-25T12:00:00.000Z", state: validSnapshot() };
    vi.mocked(saveBuildCopilotState).mockResolvedValue(savedEnvelope);

    const req = makeRequest({ state: validSnapshot() });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    expect(saveBuildCopilotState).toHaveBeenCalledOnce();
  });

  it("normalizes legacy rows before save", async () => {
    const legacyState = validSnapshot();
    legacyState.rows = [{ ...legacyState.rows[0], linkedCardId: undefined }];
    const savedEnvelope = { updatedAt: "2026-04-25T12:00:00.000Z", state: legacyState };
    vi.mocked(saveBuildCopilotState).mockResolvedValue(savedEnvelope);

    const req = makeRequest({ state: legacyState });
    const res = await PUT(req);
    expect(res.status).toBe(200);

    expect(saveBuildCopilotState).toHaveBeenCalledOnce();
    const normalizedState = vi.mocked(saveBuildCopilotState).mock.calls[0]?.[0] as {
      rows: Array<{ linkedCardId?: string | null }>;
    };
    expect(normalizedState.rows[0]?.linkedCardId).toBe("k1");
  });

  it("returns 400 for invalid JSON", async () => {
    const req = makeRequest(null, "not-json{{{");
    const res = await PUT(req);
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toMatch(/invalid json/i);
  });

  it("returns 400 when state key is missing from body", async () => {
    const req = makeRequest({ notState: "oops" });
    const res = await PUT(req);
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toMatch(/missing state/i);
  });

  it("returns 413 when payload exceeds 512 KB", async () => {
    const bigText = JSON.stringify({ state: { filler: "x".repeat(600 * 1024) } });
    const req = makeRequest(null, bigText);
    const res = await PUT(req);
    expect(res.status).toBe(413);
    const data = await res.json() as { code: string };
    expect(data.code).toBe("payload_too_large");
  });

  it("returns 422 when snapshot shape is invalid", async () => {
    const req = makeRequest({ state: { ideaText: "only one field" } });
    const res = await PUT(req);
    expect(res.status).toBe(422);
    const data = await res.json() as { code: string };
    expect(data.code).toBe("invalid_snapshot");
  });

  it("returns 422 when state is an array", async () => {
    const req = makeRequest({ state: ["not", "an", "object"] });
    const res = await PUT(req);
    expect(res.status).toBe(422);
  });

  it("returns 422 when state is a string", async () => {
    const req = makeRequest({ state: "just-a-string" });
    const res = await PUT(req);
    expect(res.status).toBe(422);
  });

  it("returns 422 when trace row linkedCardId does not exist in cards", async () => {
    const brokenLinkState = validSnapshot();
    brokenLinkState.rows = [{ ...brokenLinkState.rows[0], linkedCardId: "k-missing" }];

    const req = makeRequest({ state: brokenLinkState });
    const res = await PUT(req);
    expect(res.status).toBe(422);
    expect(saveBuildCopilotState).not.toHaveBeenCalled();
  });

  it("returns 500 when saveBuildCopilotState throws", async () => {
    vi.mocked(saveBuildCopilotState).mockRejectedValue(new Error("write error"));

    const req = makeRequest({ state: validSnapshot() });
    const res = await PUT(req);
    expect(res.status).toBe(500);
    const data = await res.json() as { error: string };
    expect(data.error).toMatch(/unable to save/i);
  });

  it("does not call saveBuildCopilotState on shape rejection", async () => {
    const req = makeRequest({ state: { bad: true } });
    await PUT(req);
    expect(saveBuildCopilotState).not.toHaveBeenCalled();
  });
});
