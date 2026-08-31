# @agentic-auto-correct/adapter-openai

OpenAI adapter for [`agentic-auto-correct`](https://www.npmjs.com/package/agentic-auto-correct) — plugs an OpenAI model in as the `CorrectionAdapter` to augment or override the offline spelling/grammar checker's results.

## Install

```sh
npm install agentic-auto-correct @agentic-auto-correct/adapter-openai openai
```

`agentic-auto-correct` and `openai` are peer dependencies — you control their versions.

## Usage

```ts
import { autoCorrect } from "agentic-auto-correct";
import { OpenAIAdapter } from "@agentic-auto-correct/adapter-openai";

const adapter = new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY });

const result = await autoCorrect("I liek turtles.", { adapter });
console.log(result.correctedText);
console.log(result.issues); // includes AI-sourced issues alongside offline ones
```

The model is called with a `json_schema` structured output, so the response is guaranteed-shape JSON rather than free text. The offline issues found before the AI call are passed along as context, so the model confirms, overrides, or adds to them rather than re-detecting everything from scratch.

### With an existing client

```ts
import OpenAI from "openai";
import { OpenAIAdapter } from "@agentic-auto-correct/adapter-openai";

const client = new OpenAI({ apiKey: "...", baseURL: "https://your-proxy.example.com" });
const adapter = new OpenAIAdapter({ client, model: "gpt-4o-mini" });
```

## License

MIT
