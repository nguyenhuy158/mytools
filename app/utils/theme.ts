import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export type Theme = "light" | "dark";

/**
 * Light/dark theme for the Navbar toggle and the command menu. Starts from the
 * saved choice, else the OS preference; changing it persists to localStorage,
 * flips `.dark` on <html> and confirms with a toast.
 */
export function useTheme() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const currentTheme = savedTheme || systemTheme;
    setTheme(currentTheme);
    document.documentElement.classList.toggle("dark", currentTheme === "dark");
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    toast.success(t(newTheme === "dark" ? "nav.toast.dark_mode" : "nav.toast.light_mode"));
  };

  return [theme, changeTheme] as const;
}
