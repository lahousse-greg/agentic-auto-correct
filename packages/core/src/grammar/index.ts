import type { CorrectionIssue, GrammarCheckConfig } from "../types/index.js";
import { GrammarChecker } from "./GrammarChecker.js";

export { GrammarChecker } from "./GrammarChecker.js";

export async function checkGrammar(
  text: string,
  config?: GrammarCheckConfig,
): Promise<CorrectionIssue[]> {
  const checker = new GrammarChecker(config);
  return checker.check(text);
}
