"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const THEME_STORAGE_KEY = "meridian-theme";

const defaultThemeContext: ThemeContextValue = {
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {}
};

const ThemeContext = createContext<ThemeContextValue>(defaultThemeContext);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Read stored preference safely on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored);
      }
    } catch {
      // Storage unavailable or disabled
    }
    setMounted(true);
  }, []);

  // Update resolved theme and DOM class
  useEffect(() => {
    const updateTheme = () => {
      const active = theme === "system" ? getSystemTheme() : theme;
      setResolvedTheme(active);

      const root = document.documentElement;
      if (active === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    updateTheme();

    // Listen for system theme changes if in "system" mode
    if (theme === "system" && typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => updateTheme();
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Storage unavailable
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: mounted ? resolvedTheme : "light", setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext) || defaultThemeContext;
}
