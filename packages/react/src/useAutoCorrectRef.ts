import { useEffect, useRef, useState } from "react";
import { attachAutoCorrect, type CorrectionResult, type ListenerOptions } from "agentic-auto-correct";

export interface UseAutoCorrectRefResult<T> {
  ref: React.RefObject<T | null>;
  result: CorrectionResult | null;
  isChecking: boolean;
}

/**
 * Attaches auto-correct to an uncontrolled input/textarea via ref, instead
 * of tracking the value in React state.
 */
export function useAutoCorrectRef<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
>(options?: ListenerOptions): UseAutoCorrectRefResult<T> {
  const ref = useRef<T>(null);
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const listener = attachAutoCorrect(element, {
      ...options,
      onStart: () => {
        setIsChecking(true);
        options?.onStart?.();
      },
      onResult: (r) => {
        setIsChecking(false);
        setResult(r);
        options?.onResult?.(r);
      },
      onError: (e) => {
        setIsChecking(false);
        options?.onError?.(e);
      },
    });

    return () => listener.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, result, isChecking };
}
