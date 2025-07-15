import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar hidratação incorreta
  useEffect(() => {
    setMounted(true);
  }, []);

  // Forçar aplicação do tema no HTML e body
  useEffect(() => {
    if (mounted && theme) {
      const html = document.documentElement;
      const body = document.body;

      console.log("Aplicando tema:", theme);

      // Remover classes antigas
      html.classList.remove("light", "dark");
      body.classList.remove("light", "dark");

      // Remover atributos antigos
      html.removeAttribute("data-theme");
      body.removeAttribute("data-theme");

      // Adicionar nova classe
      html.classList.add(theme);
      body.classList.add(theme);

      // Adicionar atributo data-theme
      html.setAttribute("data-theme", theme);
      body.setAttribute("data-theme", theme);

      // Forçar background no body com a nova paleta
      if (theme === "dark") {
        body.style.setProperty(
          "background-color",
          "hsl(240 10% 3.9%)",
          "important"
        );
        body.style.setProperty("color", "hsl(0 0% 98%)", "important");
        html.style.setProperty(
          "background-color",
          "hsl(240 10% 3.9%)",
          "important"
        );
        console.log("Tema escuro aplicado com força");
      } else {
        body.style.setProperty(
          "background-color",
          "hsl(0 0% 100%)",
          "important"
        );
        body.style.setProperty("color", "hsl(240 10% 3.9%)", "important");
        html.style.setProperty(
          "background-color",
          "hsl(0 0% 100%)",
          "important"
        );
        console.log("Tema claro aplicado com força");
      }

      // Forçar reflow para garantir que as mudanças sejam aplicadas
      body.offsetHeight;
      html.offsetHeight;
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const isLight = theme === "light";
  const isDark = theme === "dark";

  return {
    theme,
    setTheme,
    toggleTheme,
    isLight,
    isDark,
    mounted,
  };
}
