import { describe, expect, it } from "vitest";
import { autoCorrect } from "../src/pipeline/AutoCorrector.js";
import type { CorrectionAdapter } from "../src/types/index.js";

describe("autoCorrect", () => {
  it("merges spelling and grammar issues and applies best suggestions", async () => {
    const result = await autoCorrect("I liek turtles.");
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.correctedText).not.toBe(result.original);
  });

  it("passes offline issues to the adapter and uses its output", async () => {
    const adapter: CorrectionAdapter = {
      id: "fake-adapter",
      correct: async (input) => {
        expect(input.offlineIssues.length).toBeGreaterThan(0);
        return { issues: [], correctedText: "I like turtles." };
      },
    };
    const result = await autoCorrect("I liek turtles.", { adapter });
    expect(result.correctedText).toBe("I like turtles.");
  });

  it("falls back to offline-only result if the adapter throws", async () => {
    const adapter: CorrectionAdapter = {
      id: "broken-adapter",
      correct: async () => {
        throw new Error("boom");
      },
    };
    const result = await autoCorrect("I liek turtles.", { adapter });
    expect(result.issues.length).toBeGreaterThan(0);
  });
});
