"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { addCondolence } from "@/app/actions/content-actions";

export function CondolenceForm({ obituaryId }: { obituaryId: string }) {
  const t = useTranslations("memorial");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <form
      className="memorial space-y-3 p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const result = await addCondolence({ obituaryId, message });
        if (result && "ok" in result) setSent(true);
      }}
    >
      <label className="block text-sm">{t("condolence")}</label>
      <textarea className="field" value={message} onChange={(event) => setMessage(event.target.value)} />
      <button className="min-h-touch rounded-full border border-white/20 px-4" type="submit">
        {sent ? t("sent") : t("send")}
      </button>
    </form>
  );
}
