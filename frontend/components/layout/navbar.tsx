"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("#top");
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 24);
  });

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => ({
      href: link.href,
      element: document.querySelector(link.href),
    })).filter(
      (section): section is { href: (typeof NAV_LINKS)[number]["href"]; element: Element } =>
        section.element !== null,
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const match = sections.find((section) => section.element === visible.target);
        if (match) setActiveHref(match.href);
      },
      { rootMargin: "-18% 0px -58%", threshold: [0.01, 0.2, 0.5] },
    );

    sections.forEach((section) => observer.observe(section.element));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4"
      >
        <nav
          className={cn(
            "flex w-full max-w-7xl items-center justify-between gap-4 rounded-full border px-3 py-2.5 backdrop-blur-xl transition-all duration-500 sm:px-4",
            scrolled
              ? "border-white/12 bg-bg-2/90 shadow-[0_16px_44px_-14px_rgba(0,0,0,0.85)]"
              : "border-white/10 bg-bg-2/70 shadow-[0_10px_34px_-18px_rgba(0,0,0,0.7)]",
          )}
        >
          <a href="#top" aria-label="Tekoovi home" className="pl-1">
            <Logo />
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setActiveHref(link.href)}
                  aria-current={activeHref === link.href ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    activeHref === link.href
                      ? "bg-white/[0.09] text-ink"
                      : "text-ink-2 hover:bg-white/[0.06] hover:text-ink",
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <Button href="#contact" size="md" magnetic withArrow>
                Book a call
              </Button>
            </div>
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-ink md:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-bg/90 backdrop-blur-xl md:hidden"
          >
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
              className="flex h-full flex-col items-center justify-center gap-3 px-8"
            >
              {NAV_LINKS.map((link) => (
                <motion.li
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <a
                    href={link.href}
                    onClick={() => {
                      setActiveHref(link.href);
                      setOpen(false);
                    }}
                    aria-current={activeHref === link.href ? "page" : undefined}
                    className={cn(
                      "font-display text-3xl font-semibold transition-colors",
                      activeHref === link.href ? "text-brand-3" : "text-ink",
                    )}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                className="mt-6"
              >
                <Button href="#contact" size="lg" withArrow onClick={() => setOpen(false)}>
                  Book a call
                </Button>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
