import React from "react";
import { useDarkMode } from "../hooks/useDarkMode";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useDarkMode();

  return (
    <button
      onClick={toggleTheme}
      className="secondary-btn"
      style={{ display: "flex", alignItems: "center", gap: "8px" }}
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}