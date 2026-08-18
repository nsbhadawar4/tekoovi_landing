"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Logo } from "./logo";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Preloader({ logoImage }: { logoImage?: string }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const skip = reduce || Boolean(sessionStorage.getItem("tk_loaded"));
    // Always hide from an async callback (never synchronously in the effect
    // body). `skip` cases hide on the next tick; otherwise after the intro.
    const t = setTimeout(() => {
      sessionStorage.setItem("tk_loaded", "1");
      setShow(false);
    }, skip ? 0 : 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = show ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/20 blur-[120px]"
          />
          <motion.div
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative scale-125"
          >
            <Logo logoImage={logoImage} />
          </motion.div>
          <div className="relative mt-8 h-px w-40 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-linear-to-r from-brand-2 to-brand-3"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.3, ease: EASE }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
