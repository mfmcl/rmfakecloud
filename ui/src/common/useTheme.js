import { useCallback, useEffect, useState } from "react";

const KEY = "rmf-theme";

function initialTheme() {
  const stored = localStorage.getItem(KEY);
  if (stored === "ink" || stored === "paper") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "ink"
    : "paper";
}

export function useTheme() {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "ink" ? "paper" : "ink"));
  }, []);

  return { theme, toggleTheme };
}
