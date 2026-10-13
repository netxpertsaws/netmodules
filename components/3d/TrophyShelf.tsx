"use client";

import { useEnhancedMotion } from "@/hooks/use-enhanced-motion";

export function TrophyShelf({ labels }: { labels: string[] }) {
  const { reduced } = useEnhancedMotion();
  return (
    <div className="glass grid grid-cols-3 gap-3 p-4 [perspective:800px]">
      {labels.slice(0, 3).map((label, index) => (
        <div
          key={label}
          className="rounded-2xl border border-gold/30 bg-navy-900/40 p-3 text-center"
          style={{ transform: reduced ? undefined : `rotateY(${(index - 1) * 12}deg)` }}
        >
          <div className="mx-auto h-14 w-8 rounded-b-full rounded-t-md bg-gradient-to-b from-gold-soft to-gold" />
          <p className="mt-2 text-xs">{label}</p>
        </div>
      ))}
    </div>
  );
}
