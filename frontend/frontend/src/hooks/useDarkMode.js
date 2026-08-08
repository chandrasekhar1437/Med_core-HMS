import { useState, useEffect } from "react";

export function useDarkMode() {
  const [theme, setTheme] = useState(() => {
    // 1. Check local storage preference
    const savedTheme = localStorage.getItem("app-theme");
    if (savedTheme) return savedTheme;

    // 2. Default to system preferences
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply data-theme attribute to <html> element
    root.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme };
}