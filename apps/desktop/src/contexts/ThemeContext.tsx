"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "tauri-starter:theme";

function applyThemeToDom(theme: ThemeMode) {
  const root = document.documentElement;

  root.classList.remove("dark");

  if (theme === "dark") {
    root.classList.add("dark");
    return;
  }

  if (theme === "system") {
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    if (prefersDark) root.classList.add("dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");

  // Load initial theme from localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "light" || raw === "dark" || raw === "system") {
        setThemeState(raw);
        applyThemeToDom(raw);
        return;
      }
    } catch (_ignore) {
      // ignore
    }

    applyThemeToDom("system");
  }, []);

  // Keep DOM + storage in sync
  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    applyThemeToDom(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (_ignore) {
      // ignore
    }
  }, []);

  // React to system theme changes only when theme === system
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return;

    const handler = () => applyThemeToDom("system");
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
