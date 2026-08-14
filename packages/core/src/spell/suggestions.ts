const MAX_SUGGESTIONS = 5;

/**
 * Ranks nspell's raw suggestions, preferring shorter edits (closer in length
 * to the original word), and caps the list to keep issue payloads small.
 */
export function rankSuggestions(original: string, raw: string[]): string[] {
  const sorted = [...raw].sort((a, b) => {
    const da = Math.abs(a.length - original.length);
    const db = Math.abs(b.length - original.length);
    return da - db;
  });
  return sorted.slice(0, MAX_SUGGESTIONS);
}
