export type IssueType = "spelling" | "grammar" | "style";
export type IssueSeverity = "error" | "warning" | "suggestion";
export type IssueSource = "spell" | "grammar" | "ai";

export interface TextRange {
  /** Character offset, inclusive. */
  start: number;
  /** Character offset, exclusive. */
  end: number;
}

export interface CorrectionIssue {
  type: IssueType;
  severity: IssueSeverity;
  source: IssueSource;
  range: TextRange;
  /** Verbatim substring at `range` in the original text. */
  original: string;
  message: string;
  /** Ordered best-first replacements. */
  suggestions: string[];
  ruleId?: string;
}

export interface AppliedChange {
  issue: CorrectionIssue;
  replacement: string;
}

export interface CorrectionResult {
  original: string;
  correctedText: string;
  issues: CorrectionIssue[];
  appliedChanges: AppliedChange[];
}

export interface DictionarySource {
  aff: string | Buffer;
  dic: string | Buffer;
}

export interface SpellCheckConfig {
  enabled?: boolean;
  /** BCP 47 language tag. Defaults to "en". */
  language?: string;
  dictionary?: DictionarySource;
  /** Additional words that should never be flagged. */
  personalDictionary?: string[];
  /** Text matching any of these patterns is skipped entirely (e.g. URLs, code). */
  ignorePatterns?: RegExp[];
}

export interface GrammarRules {
  repeatedWords?: boolean;
  passiveVoice?: boolean;
  sentenceSpacing?: boolean;
}

export interface GrammarCheckConfig {
  enabled?: boolean;
  rules?: GrammarRules;
}

export interface AdapterContext {
  locale?: string;
  domain?: "technical" | "formal" | "casual" | string;
  /** Appended verbatim to the adapter's system prompt. */
  systemPromptAddition?: string;
}

export interface AdapterInput {
  text: string;
  /** Issues already found by the offline spell/grammar pass. */
  offlineIssues: CorrectionIssue[];
  context?: AdapterContext;
}

export interface AdapterOutput {
  issues: CorrectionIssue[];
  correctedText?: string;
}

/** The contract every AI adapter package (Anthropic, OpenAI, ...) must implement. */
export interface CorrectionAdapter {
  readonly id: string;
  correct(input: AdapterInput): Promise<AdapterOutput>;
}

export interface AutoCorrectorConfig {
  spell?: SpellCheckConfig | false;
  grammar?: GrammarCheckConfig | false;
  adapter?: CorrectionAdapter;
  /** Debounce delay in ms for the DOM listener. Defaults to 300. */
  debounce?: number;
}

export interface ListenerCallbacks {
  onResult?: (result: CorrectionResult) => void;
  onError?: (error: Error) => void;
  /** Fired when the debounce timer elapses and a check starts. */
  onStart?: () => void;
}

export type ListenerOptions = AutoCorrectorConfig & ListenerCallbacks;

export interface AutoCorrectListener {
  destroy(): void;
  getLastResult(): CorrectionResult | null;
  /** Skip the debounce and check immediately. */
  flush(): Promise<CorrectionResult | null>;
}
