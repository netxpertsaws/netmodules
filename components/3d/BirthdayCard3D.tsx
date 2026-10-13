"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/ui/GlassCard";
import { useEnhancedMotion } from "@/hooks/use-enhanced-motion";
import { sendWish } from "@/app/actions/content-actions";

export function BirthdayCard3D({
  userId,
  name,
  school,
  localDate,
}: {
  userId: string;
  name: string;
  school?: string | null;
  localDate: string;
}) {
  const t = useTranslations("birthdays");
  const { reduced } = useEnhancedMotion();
  const storageKey = `vada-birthday-${userId}-${localDate}`;
  const [open, setOpen] = useState(reduced);
  const [wish, setWish] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (reduced) return;
    if (window.localStorage.getItem(storageKey) === "open") {
      setOpen(true);
      return;
    }
    const timer = window.setTimeout(() => {
      setOpen(true);
      window.localStorage.setItem(storageKey, "open");
      void confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ["#D4A84B", "#2EC4B6", "#F4F7FB"] });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [reduced, storageKey]);

  return (
    <GlassCard>
      <div className="[perspective:800px]">
        <div
          className="origin-top rounded-2xl border border-gold/50 bg-navy-800/80 p-4 transition-transform duration-slow ease-out"
          style={{ transform: open || reduced ? "rotateX(0deg)" : "rotateX(-78deg)" }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-gold">{t("today")}</p>
          <h3 className="mt-2 text-2xl font-semibold">{name}</h3>
          <p className="text-sm text-[var(--muted)]">{school}</p>
        </div>
      </div>
      {open ? (
        <form
          className="mt-4 space-y-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const result = await sendWish({ toUserId: userId, message: wish });
            if (result && "ok" in result && result.ok) setSent(true);
          }}
        >
          <label className="block text-sm text-[var(--muted)]" htmlFor={`wish-${userId}`}>
            {t("wish")}
          </label>
          <input id={`wish-${userId}`} className="field" value={wish} onChange={(event) => setWish(event.target.value)} />
          <button className="min-h-touch rounded-full bg-teal px-4 text-navy-900" type="submit">
            {sent ? t("sent") : t("send")}
          </button>
        </form>
      ) : null}
    </GlassCard>
  );
}
