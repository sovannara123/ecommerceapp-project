"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const cycle = () => {
    const next: Theme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);

    if (next === "system") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem("theme");
    } else {
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    }
  };

  const icon = theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "💻";

  return (
    <button
      onClick={cycle}
      aria-label={`Current theme: ${theme}. Click to change.`}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgb(var(--color-border))] transition-colors duration-200 hover:bg-[rgb(var(--color-bg-tertiary))]"
      title={`Theme: ${theme}`}
    >
      <span className="text-lg">{icon}</span>
    </button>
  );
}
