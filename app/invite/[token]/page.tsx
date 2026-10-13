"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { acceptInvite } from "@/app/actions/member-actions";
import { CONSENT_NOTICE_VERSION } from "@/lib/validation/member";
import { GlassCard } from "@/components/ui/GlassCard";

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const t = useTranslations("invite");
  const consent = useTranslations("join.consent");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <GlassCard>
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-[var(--muted)]">{t("body")}</p>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const result = await acceptInvite({
              token: params.token,
              password: String(data.get("password") ?? ""),
              confirmPassword: String(data.get("confirmPassword") ?? ""),
              consents: {
                directory: data.get("directory") === "on",
                photo: data.get("photo") === "on",
                birthday: data.get("birthday") === "on",
                contact: data.get("contact") === "on",
                accuracy: data.get("accuracy") === "on",
                noticeVersion: CONSENT_NOTICE_VERSION,
              },
            });
            if (result && "ok" in result) {
              setDone(true);
              router.push("/login");
              return;
            }
            setError(result && "error" in result ? String(result.error) : "");
          }}
        >
          <input className="field" type="password" name="password" required />
          <input className="field" type="password" name="confirmPassword" required />
          <label className="flex gap-2 text-sm"><input type="checkbox" name="directory" required />{consent("directory")}</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="photo" />{consent("photo")}</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="birthday" />{consent("birthday")}</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="contact" />{consent("contact")}</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="accuracy" required />{consent("accuracy")}</label>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {done ? <p>{t("done")}</p> : null}
          <button className="min-h-touch rounded-full bg-gold px-5 text-navy-900" type="submit">{t("submit")}</button>
        </form>
      </GlassCard>
    </main>
  );
}
