import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useAutoCorrect } from "../src/useAutoCorrect.js";
import { useAutoCorrectRef } from "../src/useAutoCorrectRef.js";

function ControlledProbe({ text }: { text: string }) {
  const { result, isChecking } = useAutoCorrect(text, { debounce: 10 });
  return <div data-testid="probe">{isChecking ? "checking" : result?.issues.length ?? "idle"}</div>;
}

function UncontrolledProbe() {
  const { ref, result } = useAutoCorrectRef<HTMLInputElement>({ debounce: 10 });
  return (
    <>
      <input ref={ref} defaultValue="I liek turtles." data-testid="input" />
      <div data-testid="result">{result?.issues.length ?? "idle"}</div>
    </>
  );
}

describe("useAutoCorrect", () => {
  it("reports issues after the debounce settles", async () => {
    render(<ControlledProbe text="I liek turtles." />);
    await waitFor(() => {
      expect(screen.getByTestId("probe").textContent).not.toBe("idle");
      expect(screen.getByTestId("probe").textContent).not.toBe("checking");
    });
    expect(Number(screen.getByTestId("probe").textContent)).toBeGreaterThan(0);
  });
});

describe("useAutoCorrectRef", () => {
  it("attaches to the ref target and flushes checks on input", async () => {
    render(<UncontrolledProbe />);
    const input = screen.getByTestId("input") as HTMLInputElement;
    input.dispatchEvent(new Event("input", { bubbles: true }));

    await waitFor(() => {
      expect(screen.getByTestId("result").textContent).not.toBe("idle");
    });
  });
});
