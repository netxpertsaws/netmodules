"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function SiteHeader({ signedInHref }: { signedInHref?: string | null }) {
  const t = useTranslations();
  const locale = useLocale() === "ta" ? "ta" : "en";
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
      <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-gold">
        {t("brand.name")}
      </Link>
      <div className="flex items-center gap-2">
        <LanguageSwitcher locale={locale} />
        <ThemeToggle />
        <Link href={signedInHref ?? "/login"} className="inline-flex min-h-touch items-center rounded-full border border-[var(--line)] px-4 text-sm">
          {signedInHref ? t("nav.home") : t("nav.login")}
        </Link>
      </div>
    </header>
  );
}
