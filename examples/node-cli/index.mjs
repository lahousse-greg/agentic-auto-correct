#!/usr/bin/env node
/**
 * Usage:
 *   echo "I liek turtles" | node index.mjs
 *   node index.mjs myfile.txt
 *   node index.mjs "I liek turtles"
 */
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { autoCorrect } from "../../packages/core/dist/index.js";

async function run() {
  const arg = process.argv[2];
  let text;

  if (arg) {
    // Try to read as a file first; fall back to treating it as literal text.
    try {
      text = readFileSync(arg, "utf8");
    } catch {
      text = arg;
    }
  } else if (!process.stdin.isTTY) {
    // Read from stdin pipe
    const rl = createInterface({ input: process.stdin });
    const lines = [];
    for await (const line of rl) lines.push(line);
    text = lines.join("\n");
  } else {
    console.error("Usage: echo 'text' | node index.mjs  OR  node index.mjs <file|text>");
    process.exit(1);
  }

  const result = await autoCorrect(text.trim());

  if (result.issues.length === 0) {
    console.log("✓ No issues found.");
    return;
  }

  console.log(`Found ${result.issues.length} issue(s):\n`);
  for (const issue of result.issues) {
    const suggestions = issue.suggestions.slice(0, 3).join(", ");
    console.log(`  [${issue.type}] "${issue.original}" — ${issue.message}`);
    if (suggestions) console.log(`           Suggestions: ${suggestions}`);
  }

  console.log(`\nCorrected text:\n  ${result.correctedText}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
