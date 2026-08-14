import type { CorrectionIssue, SpellCheckConfig } from "../types/index.js";
import { SpellChecker } from "./SpellChecker.js";

export { SpellChecker } from "./SpellChecker.js";
export { loadDefaultDictionary } from "./dictionary.js";

export async function checkSpelling(
  text: string,
  config?: SpellCheckConfig,
): Promise<CorrectionIssue[]> {
  const checker = new SpellChecker(config);
  return checker.check(text);
}
