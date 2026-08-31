# agentic-auto-correct

Spelling and grammar auto-correction for text inputs, with an optional pluggable AI adapter.

Offline spelling and grammar checking work out of the box, with zero AI dependencies. An optional adapter interface lets you plug in an LLM (Claude, OpenAI, or your own) to augment or override the offline results.

## Install

```sh
npm install agentic-auto-correct
```

## Quickstart

### One-shot correction

```ts
import { autoCorrect } from "agentic-auto-correct";

const result = await autoCorrect("I liek turtles.");
console.log(result.correctedText); // "I like turtles."
console.log(result.issues);
```

### Attach to a DOM input

```ts
import { attachAutoCorrect } from "agentic-auto-correct";

const input = document.querySelector("textarea")!;
const listener = attachAutoCorrect(input, {
  debounce: 300,
  onResult: (result) => console.log(result.issues),
});

// later
listener.destroy();
```

### Add an AI adapter

```ts
import { autoCorrect } from "agentic-auto-correct";
import { AnthropicAdapter } from "@agentic-auto-correct/adapter-anthropic";

const adapter = new AnthropicAdapter({ apiKey: process.env.ANTHROPIC_API_KEY });
const result = await autoCorrect("I liek turtles.", { adapter });
```

See [`@agentic-auto-correct/adapter-openai`](https://www.npmjs.com/package/@agentic-auto-correct/adapter-openai) for the OpenAI equivalent, and [`@agentic-auto-correct/react`](https://www.npmjs.com/package/@agentic-auto-correct/react) for React hooks.

## Configuration

```ts
interface AutoCorrectorConfig {
  spell?: SpellCheckConfig | false;     // spell?.language, ?.personalDictionary, ?.ignorePatterns
  grammar?: GrammarCheckConfig | false; // grammar?.rules?.{repeatedWords,passiveVoice,sentenceSpacing}
  adapter?: CorrectionAdapter;          // optional AI adapter
  debounce?: number;                    // DOM listener debounce in ms, default 300
}
```

Only the subpaths you use are bundled — `agentic-auto-correct/spell` and `agentic-auto-correct/grammar` are independently tree-shakeable, and AI adapters live in separate packages so they're never a transitive dependency of the offline core.

## License

MIT
