import { describe, expect, it, vi } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { AnthropicAdapter } from "../src/AnthropicAdapter.js";
import { CORRECTION_TOOL_NAME } from "../src/prompt-builder.js";

function fakeClient(response: Anthropic.Message) {
  return {
    messages: { create: vi.fn().mockResolvedValue(response) },
  } as unknown as Anthropic;
}

describe("AnthropicAdapter", () => {
  it("sends the correction tool and parses a valid tool_use response", async () => {
    const client = fakeClient({
      content: [
        {
          type: "tool_use",
          id: "1",
          name: CORRECTION_TOOL_NAME,
          input: {
            issues: [
              {
                type: "spelling",
                severity: "warning",
                original: "liek",
                suggestions: ["like"],
                message: '"liek" may be misspelled.',
                start: 2,
                end: 6,
              },
            ],
            correctedText: "I like turtles.",
          },
        },
      ],
    } as unknown as Anthropic.Message);

    const adapter = new AnthropicAdapter({ client, apiKey: "test" });
    const output = await adapter.correct({ text: "I liek turtles.", offlineIssues: [] });

    expect(output.correctedText).toBe("I like turtles.");
    expect(output.issues).toHaveLength(1);
    expect(output.issues[0]?.source).toBe("ai");

    const createCall = (client.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(createCall.tools[0].name).toBe(CORRECTION_TOOL_NAME);
  });

  it("throws when the response has no tool_use block", async () => {
    const client = fakeClient({ content: [] } as unknown as Anthropic.Message);
    const adapter = new AnthropicAdapter({ client, apiKey: "test" });

    await expect(adapter.correct({ text: "hi", offlineIssues: [] })).rejects.toThrow();
  });
});
