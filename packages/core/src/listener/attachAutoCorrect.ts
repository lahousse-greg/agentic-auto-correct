import { AutoCorrector } from "../pipeline/AutoCorrector.js";
import type { AutoCorrectListener, CorrectionResult, ListenerOptions } from "../types/index.js";
import { debounce } from "./debounce.js";

type CorrectableElement = HTMLInputElement | HTMLTextAreaElement | HTMLElement;

function readText(element: CorrectableElement): string {
  if ("value" in element) return (element as HTMLInputElement).value;
  return element.textContent ?? "";
}

export function attachAutoCorrect(
  element: CorrectableElement,
  options: ListenerOptions = {},
): AutoCorrectListener {
  const { onResult, onError, onStart, debounce: debounceMs, ...correctorConfig } = options;
  const corrector = new AutoCorrector(correctorConfig);
  let lastResult: CorrectionResult | null = null;

  const runCheck = async (): Promise<CorrectionResult | null> => {
    try {
      onStart?.();
      const result = await corrector.correct(readText(element));
      lastResult = result;
      onResult?.(result);
      return result;
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  };

  const debounced = debounce(() => {
    void runCheck();
  }, debounceMs ?? 300);

  const handleInput = () => debounced.call();
  element.addEventListener("input", handleInput);
  element.addEventListener("change", handleInput);

  return {
    getLastResult: () => lastResult,
    flush: () => {
      debounced.cancel();
      return runCheck();
    },
    destroy: () => {
      debounced.cancel();
      element.removeEventListener("input", handleInput);
      element.removeEventListener("change", handleInput);
      corrector.destroy();
    },
  };
}
