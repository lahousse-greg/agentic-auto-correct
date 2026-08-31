# @agentic-auto-correct/adapter-anthropic

Anthropic Claude adapter for [`agentic-auto-correct`](https://www.npmjs.com/package/agentic-auto-correct) — plugs Claude in as the `CorrectionAdapter` to augment or override the offline spelling/grammar checker's results.

## Install

```sh
npm install agentic-auto-correct @agentic-auto-correct/adapter-anthropic @anthropic-ai/sdk
```

`agentic-auto-correct` and `@anthropic-ai/sdk` are peer dependencies — you control their versions.

## Usage

```ts
import { autoCorrect } from "agentic-auto-correct";
import { AnthropicAdapter } from "@agentic-auto-correct/adapter-anthropic";

const adapter = new AnthropicAdapter({ apiKey: process.env.ANTHROPIC_API_KEY });

const result = await autoCorrect("I liek turtles.", { adapter });
console.log(result.correctedText);
console.log(result.issues); // includes AI-sourced issues alongside offline ones
```

Claude is called via tool use so the response is structured JSON, not free text. The offline issues found before the AI call are passed along as context, so Claude confirms, overrides, or adds to them rather than re-detecting everything from scratch.

### With an existing client

```ts
import Anthropic from "@anthropic-ai/sdk";
import { AnthropicAdapter } from "@agentic-auto-correct/adapter-anthropic";

const client = new Anthropic({ apiKey: "...", baseURL: "https://your-proxy.example.com" });
const adapter = new AnthropicAdapter({ client, model: "claude-3-5-haiku-latest" });
```

## License

MIT
