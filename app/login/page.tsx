"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { googleSignInAction, loginAction } from "@/app/actions/auth-actions";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { GlassCard } from "@/components/ui/GlassCard";

function LoginForm() {
  const t = useTranslations("login");
  const router = useRouter();
  const params = useSearchParams();
  const queryError = params.get("error");
  const [error, setError] = useState(queryError === "NotRegistered" ? "pending" : queryError ?? "");
  const [busy, setBusy] = useState(false);
  const known = ["invalid", "rate", "pending", "forbidden", "timeout"] as const;
  const message = known.find((item) => item === error);

  return (
    <GlassCard>
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          const result = await loginAction(new FormData(event.currentTarget));
          setBusy(false);
          if (result && "redirectTo" in result && result.redirectTo) {
            router.push(result.redirectTo);
            router.refresh();
            return;
          }
          setError(result && "error" in result && result.error ? result.error : "invalid");
        }}
      >
        <label className="block text-sm">
          <span className="text-[var(--muted)]">{t("email")}</span>
          <input className="field mt-1" name="email" type="email" required autoComplete="username" />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">{t("password")}</span>
          <input className="field mt-1" name="password" type="password" required autoComplete="current-password" />
        </label>
        {message ? <p className="text-sm text-red-300">{t(message)}</p> : null}
        <button className="min-h-touch w-full rounded-full bg-gold font-semibold text-navy-900 disabled:opacity-60" disabled={busy} type="submit">
          {t("submit")}
        </button>
      </form>
      {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" ? (
        <form action={googleSignInAction} className="mt-3">
          <button className="min-h-touch w-full rounded-full border border-[var(--line)]" type="submit">
            {t("google")}
          </button>
        </form>
      ) : null}
    </GlassCard>
  );
}

export default function LoginPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-md px-4 py-12">
        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
