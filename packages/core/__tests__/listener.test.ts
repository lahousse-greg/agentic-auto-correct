import { describe, expect, it, vi } from "vitest";
import { attachAutoCorrect } from "../src/listener/attachAutoCorrect.js";

function createInput(value: string): HTMLInputElement {
  const input = document.createElement("input");
  input.value = value;
  return input;
}

describe("attachAutoCorrect", () => {
  it("runs a check after the debounce delay on input", async () => {
    const input = createInput("I liek turtles.");
    const onResult = vi.fn();
    const listener = attachAutoCorrect(input, { onResult, debounce: 10 });

    input.dispatchEvent(new Event("input"));
    await vi.waitFor(() => expect(onResult).toHaveBeenCalledTimes(1), { timeout: 2000 });

    listener.destroy();
  });

  it("flush() runs immediately and skips the debounce", async () => {
    const input = createInput("I liek turtles.");
    const listener = attachAutoCorrect(input, { debounce: 10_000 });

    const result = await listener.flush();
    expect(result?.issues.length).toBeGreaterThan(0);
    listener.destroy();
  });

  it("destroy() removes listeners so no further checks run", async () => {
    const input = createInput("I liek turtles.");
    const onResult = vi.fn();
    const listener = attachAutoCorrect(input, { onResult, debounce: 10 });
    listener.destroy();

    input.dispatchEvent(new Event("input"));
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(onResult).not.toHaveBeenCalled();
  });
});
