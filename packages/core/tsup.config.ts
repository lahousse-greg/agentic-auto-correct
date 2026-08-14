import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    spell: "src/spell/index.ts",
    grammar: "src/grammar/index.ts",
    listener: "src/listener/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // nspell is CJS-only; bundle it so consumers never hit ESM/CJS interop issues.
  noExternal: ["nspell"],
  external: [
    "unified",
    "retext",
    "retext-english",
    "retext-stringify",
    "retext-repeated-words",
    "retext-passive",
    "retext-sentence-spacing",
    "dictionary-en",
    "vfile",
    "vfile-message",
  ],
});
