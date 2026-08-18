"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

/** Desktop scroll-to-top button ringed by the page's reading progress. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.3,
  });

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 1200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 12 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="group fixed bottom-6 right-6 z-40 hidden h-12 w-12 place-items-center rounded-full md:grid"
        >
          <span className="glass absolute inset-0 rounded-full transition-colors duration-300 group-hover:border-brand-2/40" />
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            className="absolute inset-0 -rotate-90"
          >
            <motion.circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="var(--color-brand-2)"
              strokeWidth="3"
              strokeLinecap="round"
              pathLength={1}
              style={{ pathLength: progress }}
            />
          </svg>
          <ArrowUp className="relative h-4.5 w-4.5 text-ink-2 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-ink" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
