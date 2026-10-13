"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { requestChange } from "@/app/actions/member-actions";

export function ChangeRequestDialog() {
  const t = useTranslations("profile");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return (
      <button type="button" className="min-h-touch rounded-full bg-gold px-5 font-semibold text-navy-900" onClick={() => setOpen(true)}>
        {t("request")}
      </button>
    );
  }

  return (
    <form
      className="glass space-y-3 p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const result = await requestChange({ message });
        if (result && "ok" in result) {
          setSent(true);
          setError("");
          return;
        }
        setError(("error" in (result ?? {}) && result?.error) || "");
      }}
    >
      <p className="text-sm text-[var(--muted)]">{t("requestHint")}</p>
      <textarea className="field" value={message} onChange={(event) => setMessage(event.target.value)} />
      {sent ? <p className="text-sm text-teal">{t("sent")}</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button className="min-h-touch rounded-full bg-gold px-5 text-navy-900" type="submit">
        {t("send")}
      </button>
    </form>
  );
}
