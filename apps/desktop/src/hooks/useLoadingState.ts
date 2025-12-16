import { useCallback, useState } from "react";

type LoadingState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
};

/**
 * Helper hook to reduce boilerplate for async calls.
 *
 * Why?
 * - Keeps component code focused on UI, not repetitive try/catch/loading state.
 * - Reusable across the app and easy to unit test.
 */
export function useLoadingState<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
): LoadingState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("An error occurred");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, execute, reset };
}
