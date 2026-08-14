import type { AdapterOutput, CorrectionIssue } from "agentic-auto-correct";

interface RawIssue {
  type: string;
  severity: string;
  original: string;
  suggestions: string[];
  message: string;
  start: number;
  end: number;
}

function toCorrectionIssue(raw: RawIssue): CorrectionIssue {
  return {
    type: raw.type as CorrectionIssue["type"],
    severity: raw.severity as CorrectionIssue["severity"],
    source: "ai",
    range: { start: raw.start, end: raw.end },
    original: raw.original,
    message: raw.message,
    suggestions: raw.suggestions,
  };
}

export function parseResponse(content: string | null): AdapterOutput {
  if (!content) {
    throw new Error("OpenAI response did not include message content.");
  }

  const parsed = JSON.parse(content) as { issues: RawIssue[]; correctedText: string };
  return {
    issues: parsed.issues.map(toCorrectionIssue),
    correctedText: parsed.correctedText,
  };
}
