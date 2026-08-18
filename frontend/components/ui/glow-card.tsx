"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Card with a cursor-following purple spotlight. Uses CSS vars — no re-renders. */
export function GlowCard({
  children,
  className,
  radius = 340,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn(
        "group card-hairline relative overflow-hidden rounded-2xl transition-colors duration-300 hover:border-white/15",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${radius}px circle at var(--mx, 50%) var(--my, 0%), rgba(138,92,255,0.15), transparent 65%)`,
        }}
      />
      {children}
    </div>
  );
}
