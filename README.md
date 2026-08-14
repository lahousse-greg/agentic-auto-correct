# agentic-auto-correct

Spelling and grammar auto-correction for text inputs, with an optional pluggable AI adapter.

Offline spelling and grammar checking work out of the box, with zero AI dependencies. An optional adapter interface lets you plug in an LLM (Claude, OpenAI, or your own) to augment or override the offline results.

## Packages

| Package | Description |
|---|---|
| [`agentic-auto-correct`](packages/core) | Offline spell + grammar engine, DOM listener, core types |
| [`@agentic-auto-correct/adapter-anthropic`](packages/adapter-anthropic) | Claude adapter |
| [`@agentic-auto-correct/adapter-openai`](packages/adapter-openai) | OpenAI adapter |
| [`@agentic-auto-correct/react`](packages/react) | React hooks |

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

### React

```tsx
import { useAutoCorrect } from "@agentic-auto-correct/react";

function Editor() {
  const [text, setText] = useState("");
  const { result, isChecking } = useAutoCorrect(text);

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      {isChecking ? "Checking…" : `${result?.issues.length ?? 0} issues`}
    </div>
  );
}
```

## Configuration

```ts
interface AutoCorrectorConfig {
  spell?: SpellCheckConfig | false;   // spell?.language, ?.personalDictionary, ?.ignorePatterns
  grammar?: GrammarCheckConfig | false; // grammar?.rules?.{repeatedWords,passiveVoice,sentenceSpacing}
  adapter?: CorrectionAdapter;         // optional AI adapter
  debounce?: number;                   // DOM listener debounce in ms, default 300
}
```

Only the subpaths you use are bundled — `agentic-auto-correct/spell` and `agentic-auto-correct/grammar` are independently tree-shakeable, and AI adapters live in separate packages so they're never a transitive dependency of the offline core.

## Development

This is a pnpm workspace monorepo.

```sh
pnpm install
pnpm build       # build all packages
pnpm test        # run all test suites
pnpm typecheck   # typecheck all packages
```

## License

MIT
