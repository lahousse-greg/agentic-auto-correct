import type { AdapterInput } from "agentic-auto-correct";

export const CORRECTION_TOOL_NAME = "report_corrections";

export const correctionTool = {
  name: CORRECTION_TOOL_NAME,
  description: "Report spelling and grammar corrections for the given text.",
  input_schema: {
    type: "object" as const,
    properties: {
      issues: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["spelling", "grammar", "style"] },
            severity: { type: "string", enum: ["error", "warning", "suggestion"] },
            original: { type: "string" },
            suggestions: { type: "array", items: { type: "string" } },
            message: { type: "string" },
            start: { type: "number" },
            end: { type: "number" },
          },
          required: ["type", "severity", "original", "suggestions", "message", "start", "end"],
        },
      },
      correctedText: { type: "string" },
    },
    required: ["issues"],
  },
};

export function buildSystemPrompt(input: AdapterInput): string {
  const base =
    "You are a precise spelling and grammar corrector. You are given text and a list of " +
    "issues already found by an offline checker. Confirm, override, or add issues as needed, " +
    "then call the report_corrections tool with the complete, final issue list. Character " +
    "offsets (start/end) must be relative to the original text.";

  const domain = input.context?.domain ? `\nDomain: ${input.context.domain}.` : "";
  const extra = input.context?.systemPromptAddition ? `\n${input.context.systemPromptAddition}` : "";
  return `${base}${domain}${extra}`;
}

export function buildUserMessage(input: AdapterInput): string {
  return [
    `Text:\n"""\n${input.text}\n"""`,
    `Offline issues already found (JSON):\n${JSON.stringify(input.offlineIssues)}`,
  ].join("\n\n");
}
