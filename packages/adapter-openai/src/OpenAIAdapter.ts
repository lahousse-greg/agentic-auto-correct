import OpenAI from "openai";
import type { AdapterInput, AdapterOutput, CorrectionAdapter } from "agentic-auto-correct";
import { buildSystemPrompt, buildUserMessage, correctionSchema } from "./prompt-builder.js";
import { parseResponse } from "./response-parser.js";

export interface OpenAIAdapterConfig {
  /** Reuse an existing client, e.g. one configured with a custom baseURL. */
  client?: OpenAI;
  /** Ignored if `client` is provided. */
  apiKey?: string;
  model?: string;
}

const DEFAULT_MODEL = "gpt-4o-mini";

export class OpenAIAdapter implements CorrectionAdapter {
  readonly id: string;
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(config: OpenAIAdapterConfig = {}) {
    this.client = config.client ?? new OpenAI({ apiKey: config.apiKey });
    this.model = config.model ?? DEFAULT_MODEL;
    this.id = `openai-${this.model}`;
  }

  async correct(input: AdapterInput): Promise<AdapterOutput> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: buildSystemPrompt(input) },
        { role: "user", content: buildUserMessage(input) },
      ],
      response_format: { type: "json_schema", json_schema: correctionSchema },
    });

    return parseResponse(completion.choices[0]?.message.content ?? null);
  }
}
