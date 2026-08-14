import { unified } from "unified";
import retextEnglish from "retext-english";
import retextStringify from "retext-stringify";
import retextRepeatedWords from "retext-repeated-words";
import retextPassive from "retext-passive";
import retextSentenceSpacing from "retext-sentence-spacing";
import type { CorrectionIssue, GrammarCheckConfig } from "../types/index.js";
import { toCorrectionIssues } from "./result-builder.js";

function buildPipeline(config: GrammarCheckConfig) {
  const rules = config.rules ?? {};
  const processor = unified().use(retextEnglish).use(retextStringify);

  if (rules.repeatedWords !== false) processor.use(retextRepeatedWords);
  if (rules.passiveVoice !== false) processor.use(retextPassive);
  if (rules.sentenceSpacing !== false) processor.use(retextSentenceSpacing);

  return processor;
}

export class GrammarChecker {
  private readonly config: GrammarCheckConfig;

  constructor(config: GrammarCheckConfig = {}) {
    this.config = config;
  }

  async check(text: string): Promise<CorrectionIssue[]> {
    if (this.config.enabled === false) return [];
    const processor = buildPipeline(this.config);
    const file = await processor.process(text);
    return toCorrectionIssues(file.messages, text);
  }
}
