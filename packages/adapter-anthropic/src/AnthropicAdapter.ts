import Anthropic from "@anthropic-ai/sdk";
import type { AdapterInput, AdapterOutput, CorrectionAdapter } from "agentic-auto-correct";
import { buildSystemPrompt, buildUserMessage, correctionTool, CORRECTION_TOOL_NAME } from "./prompt-builder.js";
import { parseResponse } from "./response-parser.js";

export interface AnthropicAdapterConfig {
  /** Reuse an existing client, e.g. one configured with a custom baseURL. */
  client?: Anthropic;
  /** Ignored if `client` is provided. */
  apiKey?: string;
  model?: string;
  maxTokens?: number;
}

const DEFAULT_MODEL = "claude-3-5-haiku-latest";

export class AnthropicAdapter implements CorrectionAdapter {
  readonly id: string;
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor(config: AnthropicAdapterConfig = {}) {
    this.client = config.client ?? new Anthropic({ apiKey: config.apiKey });
    this.model = config.model ?? DEFAULT_MODEL;
    this.maxTokens = config.maxTokens ?? 2048;
    this.id = `anthropic-${this.model}`;
  }

  async correct(input: AdapterInput): Promise<AdapterOutput> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: buildSystemPrompt(input),
      messages: [{ role: "user", content: buildUserMessage(input) }],
      tools: [correctionTool],
      tool_choice: { type: "tool", name: CORRECTION_TOOL_NAME },
    });

    return parseResponse(message);
  }
}
