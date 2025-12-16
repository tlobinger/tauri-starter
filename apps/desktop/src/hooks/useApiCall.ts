import { useCallback, useEffect, useRef, useState } from "react";

type ApiCallOptions<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

type ApiCallState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  call: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
};

/**
 * Wrapper for async calls with consistent loading/error handling.
 *
 * Why not just use try/catch in each component?
 * - You *can*, but this prevents repeating the same patterns everywhere.
 * - Handles “component unmounted” safely to avoid setting state after unmount.
 */
export function useApiCall<T>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: ApiCallOptions<T> = {},
): ApiCallState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  const call = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        if (!isMountedRef.current) return null;
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("An error occurred");
        if (!isMountedRef.current) return null;
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [apiFunction, options],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { data, isLoading, error, call, reset };
}
