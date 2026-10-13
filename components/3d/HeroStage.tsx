"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useEnhancedMotion } from "@/hooks/use-enhanced-motion";

const Hero3DScene = dynamic(() => import("./Hero3DScene").then((mod) => mod.Hero3DScene), {
  ssr: false,
});

export function HeroStage({
  kicker,
  title,
  subtitle,
  cta,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  cta: string;
}) {
  const { enhance } = useEnhancedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">{kicker}</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-6xl">{title}</h1>
        <p className="mt-4 max-w-xl text-lg text-[var(--muted)]">{subtitle}</p>
        <a href="#join" className="mt-8 inline-flex min-h-touch items-center rounded-full bg-gold px-6 font-semibold text-navy-900">
          {cta}
        </a>
      </div>
      <div ref={stage} className="relative h-80 overflow-hidden rounded-card md:h-[28rem]">
        {enhance && visible ? (
          <Hero3DScene />
        ) : (
          <GlassCard className="flex h-full flex-col justify-between">
            <div className="h-28 rounded-2xl border border-gold/40 bg-gradient-to-br from-navy-800 to-teal/30" />
            <div className="mt-4 h-16 rounded-2xl border border-white/10 bg-white/5" />
            <p className="text-sm text-gold">{kicker}</p>
          </GlassCard>
        )}
      </div>
    </section>
  );
}
