# @agentic-auto-correct/react

React hooks for [`agentic-auto-correct`](https://www.npmjs.com/package/agentic-auto-correct).

## Install

```sh
npm install agentic-auto-correct @agentic-auto-correct/react
```

`agentic-auto-correct` and `react` are peer dependencies.

## `useAutoCorrect` — controlled input

```tsx
import { useState } from "react";
import { useAutoCorrect } from "@agentic-auto-correct/react";

function Editor() {
  const [text, setText] = useState("");
  const { result, isChecking, error } = useAutoCorrect(text, { debounce: 300 });

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      {isChecking ? "Checking…" : `${result?.issues.length ?? 0} issues`}
    </div>
  );
}
```

Memoize the `config` object yourself if you pass one with an `adapter` or non-default rules — a new object identity on every render re-applies the config on each render.

## `useAutoCorrectRef` — uncontrolled input

```tsx
import { useAutoCorrectRef } from "@agentic-auto-correct/react";

function Editor() {
  const { ref, result, isChecking } = useAutoCorrectRef<HTMLTextAreaElement>({ debounce: 300 });

  return (
    <div>
      <textarea ref={ref} defaultValue="" />
      {isChecking ? "Checking…" : `${result?.issues.length ?? 0} issues`}
    </div>
  );
}
```

Use this when you don't want the input's value tracked in React state — it attaches `attachAutoCorrect` directly to the DOM node via a `ref` and cleans up on unmount.

## Adding an AI adapter

Both hooks accept the same `AutoCorrectorConfig` as the core package, so an adapter plugs in the same way:

```tsx
import { AnthropicAdapter } from "@agentic-auto-correct/adapter-anthropic";

const adapter = new AnthropicAdapter({ apiKey: process.env.ANTHROPIC_API_KEY });
const { result } = useAutoCorrect(text, { adapter });
```

## License

MIT
