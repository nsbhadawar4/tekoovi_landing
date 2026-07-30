"use client";

import { AnimatePresence, motion } from "motion/react";
import { CalendarCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Mobile-only booking bar that slides in once someone has read a screen or two.
 *
 * Phones lose the header CTA the moment you scroll, which is exactly when
 * intent is highest. Dismissible, and it stays dismissed for the visit.
 */
export function StickyCta({ calendly }: { calendly?: string }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!calendly) return;
    const onScroll = () => setVisible(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [calendly]);

  if (!calendly) return null;

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-3 bottom-3 z-40 md:hidden"
        >
          <div className="glass flex items-center gap-3 rounded-2xl p-2.5 pl-4 shadow-[var(--shadow-e3)]">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                Ready to start?
              </p>
              <p className="truncate text-xs text-ink-3">
                Free 30-min strategy call
              </p>
            </div>
            <a
              href={calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white"
            >
              <CalendarCheck className="h-4 w-4" />
              Book a call
            </a>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-3 transition-colors hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
