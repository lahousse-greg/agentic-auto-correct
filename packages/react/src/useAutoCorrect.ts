import { useEffect, useRef, useState } from "react";
import { AutoCorrector, type AutoCorrectorConfig, type CorrectionResult } from "agentic-auto-correct";

export interface UseAutoCorrectResult {
  result: CorrectionResult | null;
  isChecking: boolean;
  error: Error | null;
}

/**
 * Runs auto-correct against a controlled input's text value, debounced on
 * every change. Memoize `config` yourself if you pass a non-primitive —
 * a new object identity on every render re-applies the config.
 */
export function useAutoCorrect(
  text: string,
  config?: AutoCorrectorConfig,
): UseAutoCorrectResult {
  const correctorRef = useRef<AutoCorrector | null>(null);
  if (!correctorRef.current) correctorRef.current = new AutoCorrector(config);

  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    correctorRef.current?.updateConfig(config ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  useEffect(() => {
    let cancelled = false;
    const debounceMs = config?.debounce ?? 300;

    setIsChecking(true);
    const timer = setTimeout(() => {
      correctorRef.current
        ?.correct(text)
        .then((r) => {
          if (cancelled) return;
          setResult(r);
          setError(null);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setError(err instanceof Error ? err : new Error(String(err)));
        })
        .finally(() => {
          if (!cancelled) setIsChecking(false);
        });
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => () => correctorRef.current?.destroy(), []);

  return { result, isChecking, error };
}
