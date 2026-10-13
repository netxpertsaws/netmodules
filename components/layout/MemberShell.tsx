import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BottomNav } from "@/components/ui/BottomNav";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { logoutAction } from "@/app/actions/auth-actions";

export async function MemberShell({ locale, children }: { locale: "en" | "ta"; children: React.ReactNode }) {
  const t = await getTranslations("nav");
  const brand = await getTranslations("brand");
  const links = [
    ["home", "/home"],
    ["members", "/members"],
    ["events", "/events"],
    ["album", "/album"],
    ["obituaries", "/obituaries"],
    ["achievements", "/achievements"],
    ["memoriam", "/memoriam"],
    ["profile", "/profile"],
    ["account", "/account"],
  ] as const;
  return (
    <div>
      <header className="mx-auto hidden max-w-6xl items-center justify-between gap-4 px-4 py-4 md:flex">
        <Link href={`/${locale}/home`} className="text-sm font-semibold tracking-[0.18em] text-gold">
          {brand("name")}
        </Link>
        <nav className="flex flex-wrap gap-3 text-sm">
          {links.map(([key, href]) => (
            <Link key={key} href={`/${locale}${href}`} className="min-h-touch inline-flex items-center">
              {t(key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
          <form action={logoutAction}>
            <button className="min-h-touch rounded-full border border-[var(--line)] px-3 text-sm" type="submit">
              {t("logout")}
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 pb-28 md:pb-10">{children}</div>
      <BottomNav locale={locale} />
    </div>
  );
}
