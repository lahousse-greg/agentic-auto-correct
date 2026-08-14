import { describe, expect, it } from "vitest";
import { checkGrammar } from "../src/grammar/index.js";

describe("checkGrammar", () => {
  it("flags repeated words", async () => {
    const issues = await checkGrammar("This is the the best example.");
    expect(issues.some((i) => i.ruleId === "retext-repeated-words")).toBe(true);
  });

  it("suppresses a rule when disabled via config", async () => {
    const issues = await checkGrammar("This is the the best example.", {
      rules: { repeatedWords: false },
    });
    expect(issues.some((i) => i.ruleId === "retext-repeated-words")).toBe(false);
  });

  it("returns no issues when disabled", async () => {
    const issues = await checkGrammar("This is the the best example.", { enabled: false });
    expect(issues).toHaveLength(0);
  });
});
