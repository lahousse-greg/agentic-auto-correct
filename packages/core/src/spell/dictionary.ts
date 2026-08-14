import type { DictionarySource } from "../types/index.js";

let cached: DictionarySource | null = null;

/**
 * Lazily loads the bundled English Hunspell dictionary via dynamic import,
 * so the ~2MB dictionary is only fetched/bundled when spell checking is
 * actually used.
 */
export async function loadDefaultDictionary(): Promise<DictionarySource> {
  if (cached) return cached;
  const mod = await import("dictionary-en");
  const dict = (mod as unknown as { default: DictionarySource }).default;
  cached = dict;
  return dict;
}
