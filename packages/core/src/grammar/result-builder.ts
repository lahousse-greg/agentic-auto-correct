import type { VFileMessage } from "vfile-message";
import type { CorrectionIssue, IssueSeverity, TextRange } from "../types/index.js";

function rangeFromMessage(message: VFileMessage, text: string): TextRange {
  const place = message.place;
  if (place && "start" in place && place.start.offset != null && place.end?.offset != null) {
    return { start: place.start.offset, end: place.end.offset };
  }
  if (place && "offset" in place && place.offset != null) {
    return { start: place.offset, end: place.offset };
  }
  return { start: 0, end: text.length };
}

function severityFromMessage(message: VFileMessage): IssueSeverity {
  if (message.fatal) return "error";
  return "warning";
}

export function toCorrectionIssues(messages: VFileMessage[], text: string): CorrectionIssue[] {
  return messages.map((message) => {
    const range = rangeFromMessage(message, text);
    const ruleId = message.source ?? message.ruleId ?? undefined;
    const issue: CorrectionIssue = {
      type: "grammar",
      severity: severityFromMessage(message),
      source: "grammar",
      range,
      original: text.slice(range.start, range.end),
      message: message.reason,
      suggestions: message.expected ?? [],
    };
    return ruleId ? { ...issue, ruleId } : issue;
  });
}
