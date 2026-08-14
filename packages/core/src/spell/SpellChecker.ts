import nspell from "nspell";
import type { CorrectionIssue, SpellCheckConfig, TextRange } from "../types/index.js";
import { loadDefaultDictionary } from "./dictionary.js";
import { rankSuggestions } from "./suggestions.js";

const WORD_PATTERN = /[A-Za-z']+/g;

function computeIgnoredRanges(text: string, patterns: RegExp[]): TextRange[] {
  const ranges: TextRange[] = [];
  for (const pattern of patterns) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    const global = new RegExp(pattern.source, flags);
    let match: RegExpExecArray | null;
    while ((match = global.exec(text))) {
      ranges.push({ start: match.index, end: match.index + match[0].length });
      if (match[0].length === 0) global.lastIndex++;
    }
  }
  return ranges;
}

function isWithinAny(range: TextRange, ignored: TextRange[]): boolean {
  return ignored.some((r) => range.start >= r.start && range.end <= r.end);
}

export class SpellChecker {
  private speller: ReturnType<typeof nspell> | null = null;
  private initPromise: Promise<void> | null = null;
  private readonly config: SpellCheckConfig;

  constructor(config: SpellCheckConfig = {}) {
    this.config = config;
  }

  private async init(): Promise<void> {
    if (this.speller) return;
    if (!this.initPromise) {
      this.initPromise = (async () => {
        const dict = this.config.dictionary ?? (await loadDefaultDictionary());
        this.speller = nspell(dict);
        for (const word of this.config.personalDictionary ?? []) {
          this.speller.add(word);
        }
      })();
    }
    return this.initPromise;
  }

  async check(text: string): Promise<CorrectionIssue[]> {
    if (this.config.enabled === false) return [];
    await this.init();
    const speller = this.speller;
    if (!speller) return [];

    const ignored = computeIgnoredRanges(text, this.config.ignorePatterns ?? []);
    const issues: CorrectionIssue[] = [];

    let match: RegExpExecArray | null;
    const pattern = new RegExp(WORD_PATTERN);
    while ((match = pattern.exec(text))) {
      const word = match[0];
      const range: TextRange = { start: match.index, end: match.index + word.length };
      if (isWithinAny(range, ignored)) continue;
      if (speller.correct(word)) continue;

      issues.push({
        type: "spelling",
        severity: "warning",
        source: "spell",
        range,
        original: word,
        message: `"${word}" may be misspelled.`,
        suggestions: rankSuggestions(word, speller.suggest(word)),
        ruleId: "spelling",
      });
    }

    return issues;
  }

  addToDictionary(words: string[]): void {
    this.config.personalDictionary = [...(this.config.personalDictionary ?? []), ...words];
    if (this.speller) {
      for (const word of words) this.speller.add(word);
    }
  }
}
