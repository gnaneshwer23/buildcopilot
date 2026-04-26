import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local to enable AI generation.",
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function callClaude(
  userMessage: string,
  systemPrompt: string,
  temperature = 0.3,
): Promise<string> {
  const client = getClient();
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    temperature,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = message.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");

  const raw = block.text.trim();
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return fenceMatch ? fenceMatch[1].trim() : raw;
}
