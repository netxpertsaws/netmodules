"use client";

import { useEnhancedMotion } from "@/hooks/use-enhanced-motion";

export function AlbumCoverflow({
  items,
}: {
  items: { id: string; title: string; href: string; image?: string | null }[];
}) {
  const { reduced } = useEnhancedMotion();
  if (!items.length) return null;
  return (
    <div className="flex gap-4 overflow-x-auto py-6 [perspective:1000px]">
      {items.map((item, index) => {
        const rotate = reduced ? 0 : (index - (items.length - 1) / 2) * -8;
        return (
          <a
            key={item.id}
            href={item.href}
            className="glass block h-52 w-40 shrink-0 p-3 transition-transform duration-base"
            style={{ transform: `rotateY(${rotate}deg) translateZ(0)` }}
          >
            <div className="h-32 rounded-xl bg-gradient-to-br from-gold/50 to-teal/40">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="" className="h-full w-full rounded-xl object-cover" />
              ) : null}
            </div>
            <p className="mt-3 text-sm font-medium">{item.title}</p>
          </a>
        );
      })}
    </div>
  );
}
