import { useMemo, useState } from "react";
import { AnthropicAdapter } from "@agentic-auto-correct/adapter-anthropic";
import { useAutoCorrect } from "@agentic-auto-correct/react";
import type { AutoCorrectorConfig, CorrectionIssue } from "agentic-auto-correct";
import { IssueList } from "./IssueList.js";

const API_KEY = import.meta.env.ANTHROPIC_API_KEY as string | undefined;

export function App() {
  const [text, setText] = useState(
    "I liek turtles. The the sky is beutiful. This was done by them.",
  );
  const [useAI, setUseAI] = useState(false);

  const config = useMemo<AutoCorrectorConfig>(
    () => ({
      debounce: 500,
      adapter:
        useAI && API_KEY ? new AnthropicAdapter({ apiKey: API_KEY }) : undefined,
    }),
    [useAI],
  );

  const { result, isChecking, error } = useAutoCorrect(text, config);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>agentic-auto-correct</h1>
      <p style={styles.subtitle}>
        Offline spell + grammar checking, with optional Claude AI augmentation.
      </p>

      <label style={styles.toggleLabel}>
        <input
          type="checkbox"
          checked={useAI}
          onChange={(e) => setUseAI(e.target.checked)}
          disabled={!API_KEY}
        />
        {" "}Use Claude AI
        {!API_KEY && (
          <span style={styles.hint}> (set ANTHROPIC_API_KEY in .env to enable)</span>
        )}
      </label>

      <textarea
        style={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something with spelling or grammar errors…"
      />

      <div style={styles.status}>
        {isChecking
          ? "Checking…"
          : error
            ? `Error: ${error.message}`
            : result
              ? `${result.issues.length} issue${result.issues.length === 1 ? "" : "s"} found`
              : ""}
      </div>

      {result && result.issues.length > 0 && (
        <IssueList
          issues={result.issues}
          onApply={(issue, word) => {
            setText(
              (prev) =>
                prev.slice(0, issue.range.start) + word + prev.slice(issue.range.end),
            );
          }}
        />
      )}

      {result && result.correctedText !== result.original && (
        <div style={styles.corrected}>
          <strong>Auto-corrected:</strong> {result.correctedText}
          <button style={styles.applyBtn} onClick={() => setText(result.correctedText)}>
            Apply all
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "system-ui, sans-serif",
    maxWidth: 700,
    margin: "3rem auto",
    padding: "0 1rem",
    color: "#1a1a1a",
  } as React.CSSProperties,
  heading: { fontSize: "1.5rem", marginBottom: "0.2rem" } as React.CSSProperties,
  subtitle: { color: "#666", marginTop: 0 } as React.CSSProperties,
  toggleLabel: { display: "block", marginBottom: "0.75rem", cursor: "pointer" } as React.CSSProperties,
  hint: { color: "#999", fontSize: "0.85rem" } as React.CSSProperties,
  textarea: {
    width: "100%",
    minHeight: 120,
    fontSize: "1rem",
    lineHeight: 1.6,
    padding: "0.75rem",
    border: "1px solid #ccc",
    borderRadius: 6,
    resize: "vertical",
    boxSizing: "border-box",
  } as React.CSSProperties,
  status: { marginTop: "0.5rem", fontSize: "0.85rem", color: "#666", minHeight: "1.2em" } as React.CSSProperties,
  corrected: {
    marginTop: "1rem",
    padding: "0.75rem",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 6,
    fontSize: "0.95rem",
    display: "flex",
    gap: "1rem",
    alignItems: "baseline",
  } as React.CSSProperties,
  applyBtn: {
    marginLeft: "auto",
    padding: "0.25rem 0.75rem",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "0.85rem",
  } as React.CSSProperties,
} as const;
