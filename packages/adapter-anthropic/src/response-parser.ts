import type Anthropic from "@anthropic-ai/sdk";
import type { AdapterOutput, CorrectionIssue } from "agentic-auto-correct";
import { CORRECTION_TOOL_NAME } from "./prompt-builder.js";

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

export function parseResponse(message: Anthropic.Message): AdapterOutput {
  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock =>
      block.type === "tool_use" && block.name === CORRECTION_TOOL_NAME,
  );

  if (!toolUse) {
    throw new Error(`Anthropic response did not include a "${CORRECTION_TOOL_NAME}" tool call.`);
  }

  const input = toolUse.input as { issues: RawIssue[]; correctedText?: string };
  const issues = input.issues.map(toCorrectionIssue);
  return input.correctedText != null ? { issues, correctedText: input.correctedText } : { issues };
}
