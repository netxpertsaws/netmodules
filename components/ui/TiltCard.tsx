"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useEnhancedMotion } from "@/hooks/use-enhanced-motion";

/** CSS 3D tilt. Pointer on desktop, tap/gyro-style nudge on touch. */
export function TiltCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useEnhancedMotion();

  function apply(x: number, y: number) {
    const node = ref.current;
    if (!node || reduced) return;
    node.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
  }

  return (
    <div className="[perspective:900px]">
      <div
        ref={ref}
        className={cn("transition-transform duration-base ease-out will-change-transform", className)}
        onMouseMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const px = (event.clientX - bounds.left) / bounds.width - 0.5;
          const py = (event.clientY - bounds.top) / bounds.height - 0.5;
          apply(py * -8, px * 10);
        }}
        onMouseLeave={() => apply(0, 0)}
        onClick={(event) => {
          if (window.matchMedia("(pointer: fine)").matches) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const px = (event.clientX - bounds.left) / bounds.width - 0.5;
          apply(6, px * 12);
          window.setTimeout(() => apply(0, 0), 500);
        }}
      >
        {children}
      </div>
    </div>
  );
}
