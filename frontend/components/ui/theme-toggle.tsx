"use client";

import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

/** Subscribe to changes of the <html data-theme> attribute. */
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

/**
 * Sun/moon button that flips the site between light and dark. The active theme
 * lives on <html data-theme>; the no-flash init script in the site layout sets
 * it before paint. We read it reactively (no setState-in-effect) and, on click,
 * flip the attribute + remember the choice.
 */
export function ThemeToggle({ className }: { className?: string }) {
  // Server + hydration render as dark (matches the default markup); the store
  // re-reads the real attribute on the client immediately after.
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark");
  const isDark = theme === "dark";

  function toggle() {
    const nextTheme: Theme = isDark ? "light" : "dark";
    const root = document.documentElement;
    root.setAttribute("data-theme", nextTheme);
    root.style.colorScheme = nextTheme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      /* storage blocked — the in-memory toggle still works for this visit */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04] text-ink transition-colors hover:border-white/20 hover:bg-white/[0.08]",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 12, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -12, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="grid place-items-center"
        >
          {isDark ? (
            <Moon className="h-[18px] w-[18px]" />
          ) : (
            <Sun className="h-[18px] w-[18px] text-brand-3" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
