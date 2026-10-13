"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const items = [
  { href: "/home", key: "home" },
  { href: "/members", key: "members" },
  { href: "/album", key: "album" },
  { href: "/profile", key: "profile" },
] as const;

export function BottomNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-[var(--bg)]/90 px-2 py-2 backdrop-blur md:hidden">
      <ul className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const href = `/${locale}${item.href}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={item.key}>
              <Link
                href={href}
                className={`flex min-h-touch items-center justify-center rounded-2xl text-xs ${active ? "bg-gold text-navy-900" : ""}`}
              >
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
