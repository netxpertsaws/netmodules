"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { updateLocale } from "@/app/actions/member-actions";

export function LanguageSwitcher({ locale }: { locale: "en" | "ta" }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const next = locale === "en" ? "ta" : "en";

  async function switchLocale() {
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;samesite=lax`;
    const member = pathname.match(/^\/(en|ta)(\/.*)?$/);
    if (member) {
      await updateLocale(next);
      router.push(`/${next}${member[2] ?? "/home"}`);
      return;
    }
    router.refresh();
  }

  return (
    <button type="button" className="min-h-touch min-w-touch rounded-full border border-[var(--line)] px-3 text-sm" onClick={switchLocale}>
      {t("language")}: {next.toUpperCase()}
    </button>
  );
}
