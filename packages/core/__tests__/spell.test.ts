import { describe, expect, it } from "vitest";
import { checkSpelling } from "../src/spell/index.js";

describe("checkSpelling", () => {
  it("flags a misspelled word with suggestions", async () => {
    const issues = await checkSpelling("I liek turtles.");
    expect(issues).toHaveLength(1);
    expect(issues[0]?.original).toBe("liek");
    expect(issues[0]?.suggestions.length).toBeGreaterThan(0);
  });

  it("does not flag correctly spelled text", async () => {
    const issues = await checkSpelling("I like turtles.");
    expect(issues).toHaveLength(0);
  });

  it("respects the personal dictionary", async () => {
    const issues = await checkSpelling("Showpad is great.", {
      personalDictionary: ["Showpad"],
    });
    expect(issues).toHaveLength(0);
  });

  it("skips text matching ignore patterns", async () => {
    const issues = await checkSpelling("Visit htxxp://exampple.com today.", {
      ignorePatterns: [/htxxp:\/\/\S+/],
    });
    expect(issues.some((i) => i.original === "htxxp")).toBe(false);
  });

  it("returns no issues when disabled", async () => {
    const issues = await checkSpelling("liek", { enabled: false });
    expect(issues).toHaveLength(0);
  });
});
