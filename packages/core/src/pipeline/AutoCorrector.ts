import { SpellChecker } from "../spell/SpellChecker.js";
import { GrammarChecker } from "../grammar/GrammarChecker.js";
import type {
  AutoCorrectorConfig,
  CorrectionIssue,
  CorrectionResult,
  AppliedChange,
} from "../types/index.js";

function applyBestSuggestions(text: string, issues: CorrectionIssue[]): {
  correctedText: string;
  appliedChanges: AppliedChange[];
} {
  // Apply in descending start-offset order so earlier replacements don't
  // shift the offsets of ranges still pending application.
  const applicable = issues
    .filter((issue) => issue.suggestions.length > 0)
    .sort((a, b) => b.range.start - a.range.start);

  let result = text;
  const appliedChanges: AppliedChange[] = [];
  for (const issue of applicable) {
    const replacement = issue.suggestions[0]!;
    result = result.slice(0, issue.range.start) + replacement + result.slice(issue.range.end);
    appliedChanges.push({ issue, replacement });
  }

  return { correctedText: result, appliedChanges };
}

export class AutoCorrector {
  private config: AutoCorrectorConfig;
  private spellChecker: SpellChecker | null = null;
  private grammarChecker: GrammarChecker | null = null;

  constructor(config: AutoCorrectorConfig = {}) {
    this.config = config;
  }

  private getSpellChecker(): SpellChecker | null {
    if (this.config.spell === false) return null;
    if (!this.spellChecker) this.spellChecker = new SpellChecker(this.config.spell ?? {});
    return this.spellChecker;
  }

  private getGrammarChecker(): GrammarChecker | null {
    if (this.config.grammar === false) return null;
    if (!this.grammarChecker) this.grammarChecker = new GrammarChecker(this.config.grammar ?? {});
    return this.grammarChecker;
  }

  async checkSpelling(text: string): Promise<CorrectionIssue[]> {
    return (await this.getSpellChecker()?.check(text)) ?? [];
  }

  async checkGrammar(text: string): Promise<CorrectionIssue[]> {
    return (await this.getGrammarChecker()?.check(text)) ?? [];
  }

  async correct(text: string): Promise<CorrectionResult> {
    const [spellIssues, grammarIssues] = await Promise.all([
      this.checkSpelling(text),
      this.checkGrammar(text),
    ]);

    let issues: CorrectionIssue[] = [...spellIssues, ...grammarIssues];

    if (this.config.adapter) {
      try {
        const output = await this.config.adapter.correct({
          text,
          offlineIssues: issues,
        });
        issues = output.issues;
        if (output.correctedText != null) {
          return {
            original: text,
            correctedText: output.correctedText,
            issues,
            appliedChanges: [],
          };
        }
      } catch {
        // Adapter failure degrades gracefully to the offline-only result.
      }
    }

    const { correctedText, appliedChanges } = applyBestSuggestions(text, issues);
    return { original: text, correctedText, issues, appliedChanges };
  }

  updateConfig(config: Partial<AutoCorrectorConfig>): void {
    this.config = { ...this.config, ...config };
    this.spellChecker = null;
    this.grammarChecker = null;
  }

  addToDictionary(words: string[]): void {
    this.getSpellChecker()?.addToDictionary(words);
  }

  destroy(): void {
    this.spellChecker = null;
    this.grammarChecker = null;
  }
}

export function createAutoCorrector(config: AutoCorrectorConfig): AutoCorrector {
  return new AutoCorrector(config);
}

export async function autoCorrect(
  text: string,
  config?: AutoCorrectorConfig,
): Promise<CorrectionResult> {
  return new AutoCorrector(config).correct(text);
}
