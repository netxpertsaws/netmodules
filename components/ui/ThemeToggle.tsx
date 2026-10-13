"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const t = useTranslations("common");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("vada-theme", next);
    setTheme(next);
  }

  return (
    <button type="button" className="min-h-touch rounded-full border border-[var(--line)] px-3 text-sm" onClick={toggle}>
      {theme === "dark" ? t("light") : t("dark")}
    </button>
  );
}
