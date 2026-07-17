"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Sticky clause index that highlights whichever clause is in view. */
export function LegalToc({
  items,
}: {
  items: { id: string; slug: string; heading: string }[];
}) {
  const [activeSlug, setActiveSlug] = useState(items[0]?.slug ?? "");

  useEffect(() => {
    const targets = items
      .map((i) => document.getElementById(i.slug))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveSlug(visible.target.id);
      },
      { rootMargin: "-120px 0px -70% 0px", threshold: 0 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="flex flex-col gap-1">
      <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        On this page
      </p>
      {items.map((item, i) => {
        const active = activeSlug === item.slug;
        return (
          <a
            key={item.id}
            href={`#${item.slug}`}
            aria-current={active ? "true" : undefined}
            className={cn(
              "group flex items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-white/[0.06] text-ink"
                : "text-ink-3 hover:bg-white/[0.03] hover:text-ink-2",
            )}
          >
            <span
              className={cn(
                "mt-px shrink-0 font-mono text-[11px] tabular-nums transition-colors",
                active ? "text-brand-3" : "text-ink-3/60 group-hover:text-ink-3",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="leading-snug">{item.heading}</span>
          </a>
        );
      })}
    </nav>
  );
}
