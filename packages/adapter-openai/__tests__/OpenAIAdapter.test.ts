import { describe, expect, it, vi } from "vitest";
import type OpenAI from "openai";
import { OpenAIAdapter } from "../src/OpenAIAdapter.js";

function fakeClient(content: string | null) {
  return {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content } }],
        }),
      },
    },
  } as unknown as OpenAI;
}

describe("OpenAIAdapter", () => {
  it("sends a json_schema response_format and parses the result", async () => {
    const content = JSON.stringify({
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
    });
    const client = fakeClient(content);
    const adapter = new OpenAIAdapter({ client, apiKey: "test" });

    const output = await adapter.correct({ text: "I liek turtles.", offlineIssues: [] });

    expect(output.correctedText).toBe("I like turtles.");
    expect(output.issues[0]?.source).toBe("ai");

    const createCall = (client.chat.completions.create as ReturnType<typeof vi.fn>).mock
      .calls[0][0];
    expect(createCall.response_format.type).toBe("json_schema");
  });

  it("throws when the response has no content", async () => {
    const client = fakeClient(null);
    const adapter = new OpenAIAdapter({ client, apiKey: "test" });

    await expect(adapter.correct({ text: "hi", offlineIssues: [] })).rejects.toThrow();
  });
});
