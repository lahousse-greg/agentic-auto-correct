import type { CorrectionIssue } from "agentic-auto-correct";

interface Props {
  issues: CorrectionIssue[];
  onApply: (issue: CorrectionIssue, word: string) => void;
}

export function IssueList({ issues, onApply }: Props) {
  return (
    <div style={{ marginTop: "1rem" }}>
      {issues.map((issue, i) => (
        <div key={i} style={{ ...styles.issue, ...typeColor(issue.type) }}>
          <span style={styles.badge}>{issue.type}</span>
          <span style={styles.original}>&ldquo;{issue.original}&rdquo;</span>
          <span style={styles.message}>{issue.message}</span>
          {issue.suggestions.slice(0, 3).map((s) => (
            <button key={s} style={styles.suggestion} onClick={() => onApply(issue, s)}>
              {s}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function typeColor(type: string): React.CSSProperties {
  if (type === "spelling") return { borderLeftColor: "#ef4444", background: "#fef2f2" };
  if (type === "grammar") return { borderLeftColor: "#f59e0b", background: "#fffbeb" };
  return { borderLeftColor: "#6366f1", background: "#eef2ff" };
}

const styles = {
  issue: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    alignItems: "center",
    padding: "0.6rem 0.75rem",
    borderRadius: 5,
    borderLeft: "3px solid #ccc",
    marginBottom: "0.5rem",
    fontSize: "0.9rem",
  } as React.CSSProperties,
  badge: {
    fontWeight: 600,
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#555",
  } as React.CSSProperties,
  original: { fontWeight: 600 } as React.CSSProperties,
  message: { color: "#555", flexGrow: 1 } as React.CSSProperties,
  suggestion: {
    padding: "0.15rem 0.5rem",
    background: "#fff",
    border: "1px solid #16a34a",
    color: "#16a34a",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "0.85rem",
  } as React.CSSProperties,
} as const;
