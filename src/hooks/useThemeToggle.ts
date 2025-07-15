"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export const useThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return {
    mounted,
    theme,
    resolvedTheme,
    toggleTheme,
    setTheme,
  };
};
