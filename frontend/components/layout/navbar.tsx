"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Navbar({ calendly }: { calendly: string }) {
  const pathname = usePathname();
  // The section anchors only exist on the landing page. Everywhere else (the
  // legal pages) the same links have to navigate home first.
  const isHome = pathname === "/";
  const hrefFor = (hash: string) => (isHome ? hash : `/${hash}`);

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState(isHome ? "#home" : "");
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 24);
  });

  useEffect(() => {
    // Off the landing page the anchors don't exist, so there is nothing to spy on.
    if (!isHome) return;

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
  }, [isHome]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // `activeHref` is only ever written by the landing-page scroll spy, so ignore
  // whatever it last held once we've navigated away.
  const currentHref = isHome ? activeHref : "";
  const indicatorHref = hoveredHref ?? currentHref;

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-0"
    >
      <nav className="relative w-full max-w-7xl">
        {/* Ambient brand glow that fades in once the page is scrolled */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-x-16 -bottom-10 -top-6 -z-10 transition-opacity duration-700",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="mx-auto h-full w-2/3 rounded-full bg-brand/12 blur-3xl" />
        </div>

        {/* Gradient hairline ring */}
        <div
          className={cn(
            "rounded-full transition-all duration-500",
            scrolled
              ? "bg-[linear-gradient(120deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04)_38%,rgba(138,92,255,0.32)_64%,rgba(255,255,255,0.12))] shadow-[0_18px_50px_-16px_rgba(0,0,0,0.9)]"
              : "bg-[linear-gradient(120deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.08))]",
          )}
        >
          <div
            className={cn(
              "relative flex items-center justify-between gap-3 rounded-full px-2.5 py-2 backdrop-blur-xl transition-colors duration-500 sm:px-3",
              scrolled ? "bg-bg-2/85 saturate-150" : "bg-bg-2/45",
            )}
          >
            {/* Top sheen */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />

            <Link
              href={hrefFor("#home")}
              aria-label="Tekoovi home"
              className="group relative pl-1"
            >
              <Logo className="transition-transform duration-300 group-hover:scale-[1.03]" />
            </Link>

            <ul
              className="hidden items-center gap-0.5 md:flex"
              onMouseLeave={() => setHoveredHref(null)}
            >
              {NAV_LINKS.map((link) => {
                const isActive = currentHref === link.href;
                return (
                  <li key={link.href} className="relative">
                    <Link
                      href={hrefFor(link.href)}
                      onClick={() => setActiveHref(link.href)}
                      onMouseEnter={() => setHoveredHref(link.href)}
                      onFocus={() => setHoveredHref(link.href)}
                      onBlur={() => setHoveredHref(null)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "relative block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
                        isActive ? "text-ink" : "text-ink-2 hover:text-ink",
                      )}
                    >
                      {indicatorHref === link.href && (
                        <motion.span
                          layoutId="nav-indicator"
                          aria-hidden
                          className="absolute inset-0 -z-10 rounded-full bg-white/[0.08] ring-1 ring-inset ring-white/10"
                          transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.6 }}
                        />
                      )}
                      <span className="relative">{link.label}</span>
                    </Link>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-dot"
                        aria-hidden
                        className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-3 shadow-[0_0_8px_2px_rgba(179,136,255,0.7)]"
                        transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.6 }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <Button href={calendly} size="md" magnetic withArrow>
                  Book a call
                </Button>
              </div>
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-ink transition-colors hover:bg-white/[0.08] md:hidden"
              >
                <span className="relative block h-3.5 w-[18px]">
                  <motion.span
                    animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="absolute left-0 top-0 block h-0.5 w-full rounded-full bg-current"
                  />
                  <motion.span
                    animate={open ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-1.5 block h-0.5 w-full rounded-full bg-current"
                  />
                  <motion.span
                    animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="absolute bottom-0 left-0 block h-0.5 w-full rounded-full bg-current"
                  />
                </span>
              </button>
            </div>

            {/* Reading progress */}
            <motion.div
              aria-hidden
              style={{ scaleX: progress }}
              className={cn(
                "pointer-events-none absolute inset-x-[16%] bottom-0 h-px origin-left rounded-full bg-gradient-to-r from-brand via-brand-3 to-transparent transition-opacity duration-500",
                scrolled ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
        </div>

        {/* Mobile sheet */}
        <AnimatePresence>
          {open && (
            <>
              <motion.button
                type="button"
                aria-label="Close menu"
                tabIndex={-1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 -z-10 cursor-default bg-bg/70 backdrop-blur-sm md:hidden"
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.32, ease: EASE }}
                className="absolute inset-x-0 top-full mt-2 origin-top md:hidden"
              >
                <div className="rounded-[28px] bg-[linear-gradient(140deg,rgba(255,255,255,0.16),rgba(138,92,255,0.22),rgba(255,255,255,0.06))] p-px shadow-[0_28px_70px_-20px_rgba(0,0,0,0.95)]">
                  <div className="rounded-[27px] bg-bg-2/95 p-3 backdrop-blur-2xl">
                    <motion.ul
                      initial="hidden"
                      animate="show"
                      variants={{
                        show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
                      }}
                      className="flex flex-col gap-1"
                    >
                      {NAV_LINKS.map((link) => {
                        const isActive = currentHref === link.href;
                        return (
                          <motion.li
                            key={link.href}
                            variants={{
                              hidden: { opacity: 0, y: 10 },
                              show: { opacity: 1, y: 0 },
                            }}
                          >
                            <Link
                              href={hrefFor(link.href)}
                              onClick={() => {
                                setActiveHref(link.href);
                                setOpen(false);
                              }}
                              aria-current={isActive ? "page" : undefined}
                              className={cn(
                                "flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-colors",
                                isActive
                                  ? "bg-white/[0.07] text-ink"
                                  : "text-ink-2 hover:bg-white/[0.04] hover:text-ink",
                              )}
                            >
                              {link.label}
                              {isActive && (
                                <span className="h-1.5 w-1.5 rounded-full bg-brand-3 shadow-[0_0_8px_2px_rgba(179,136,255,0.7)]" />
                              )}
                            </Link>
                          </motion.li>
                        );
                      })}
                      <motion.li
                        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                        className="mt-2 px-1 pb-1"
                      >
                        <Button
                          href={calendly}
                          size="lg"
                          withArrow
                          className="w-full"
                          onClick={() => setOpen(false)}
                        >
                          Book a call
                        </Button>
                      </motion.li>
                    </motion.ul>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
