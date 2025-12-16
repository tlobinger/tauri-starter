"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ErrorContextValue = {
  lastError: string | null;
  setError: (message: string | null) => void;
  clearError: () => void;
};

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [lastError, setLastError] = useState<string | null>(null);

  const setError = useCallback((message: string | null) => {
    setLastError(message);
  }, []);

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  const value = useMemo(
    () => ({
      lastError,
      setError,
      clearError,
    }),
    [lastError, setError, clearError],
  );

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
}

export function useErrorContext() {
  const ctx = useContext(ErrorContext);
  if (!ctx) {
    throw new Error("useErrorContext must be used within ErrorProvider");
  }
  return ctx;
}
