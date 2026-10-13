"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { changePasswordAction } from "@/app/actions/auth-actions";
import { updateLocale } from "@/app/actions/member-actions";
import { GlassCard } from "@/components/ui/GlassCard";

export default function AccountPage() {
  const t = useTranslations("account");
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <GlassCard>
        <h1 className="text-2xl font-semibold">{t("password")}</h1>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const result = await changePasswordAction(new FormData(event.currentTarget));
            if (result && "ok" in result) {
              setMessage(t("saved"));
              setError("");
              return;
            }
            setError(t("password"));
          }}
        >
          <label className="block text-sm">{t("current")}<input className="field mt-1" name="currentPassword" type="password" required /></label>
          <label className="block text-sm">{t("next")}<input className="field mt-1" name="password" type="password" required /></label>
          <label className="block text-sm">{t("confirm")}<input className="field mt-1" name="confirmPassword" type="password" required /></label>
          {message ? <p className="text-sm text-teal">{message}</p> : null}
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button className="min-h-touch rounded-full bg-gold px-5 font-semibold text-navy-900" type="submit">{t("save")}</button>
        </form>
      </GlassCard>
      <GlassCard>
        <h2 className="text-2xl font-semibold">{t("language")}</h2>
        <div className="mt-4 flex gap-3">
          {(["en", "ta"] as const).map((locale) => (
            <button
              key={locale}
              type="button"
              className={`min-h-touch rounded-full px-4 ${params.locale === locale ? "bg-gold text-navy-900" : "border border-[var(--line)]"}`}
              onClick={async () => {
                await updateLocale(locale);
                document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;samesite=lax`;
                router.push(`/${locale}/account`);
              }}
            >
              {locale === "en" ? t("english") : t("tamil")}
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
