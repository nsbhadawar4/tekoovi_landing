"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useRef } from "react";
import {
  isHidden,
  type Hero as HeroContent,
  type Stat,
  type Testimonial,
} from "@/backend/types";
import { Button } from "@/components/ui/button";
import { AuroraBlobs, GridBackdrop } from "@/components/ui/backgrounds";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { Container } from "@/components/ui/section";
import { Stars } from "@/components/ui/stars";
import { WordReveal } from "@/components/ui/word-reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

export function Hero({
  hero,
  stats = [],
  testimonials = [],
}: {
  hero: HeroContent;
  /** Feeds the proof chips under the CTAs. */
  stats?: Stat[];
  /** Feeds the avatar stack — real people, never invented ones. */
  testimonials?: Testimonial[];
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const floatY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  const showPrimary = Boolean(hero.primaryLabel && hero.primaryHref);
  const showSecondary = Boolean(hero.secondaryLabel && hero.secondaryHref);

  // Proof chips: the first two stats that still have both halves showing.
  const proof = stats
    .filter((s) => s.label && !isHidden(s, "value"))
    .slice(0, 2);
  const faces = testimonials
    .filter((t) => t.initials)
    .slice(0, 4)
    .map((t) => ({ id: t.id, initials: t.initials, name: t.name }));

  function handleMove(e: React.MouseEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - r.left}px`);
    el.style.setProperty("--sy", `${e.clientY - r.top}px`);
  }

  return (
    <section
      id="home"
      ref={ref}
      onMouseMove={handleMove}
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-24 pt-32 sm:pt-36"
    >
      {/* ---------- background stack ---------- */}
      {hero.backgroundImage && (
        <>
          <motion.div
            aria-hidden
            style={{
              backgroundImage: `url(${hero.backgroundImage})`,
              scale: bgScale,
            }}
            className="absolute inset-0 bg-cover bg-center"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,15,0.62),rgba(8,9,15,0.88))]"
          />
        </>
      )}
      <AuroraBlobs />
      <GridBackdrop />

      {/* cursor spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] opacity-70"
        style={{
          background:
            "radial-gradient(560px circle at var(--sx, 50%) var(--sy, 30%), rgba(108,59,255,0.13), transparent 70%)",
        }}
      />
      {/* soft dissolve into the section below */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-40 bg-[linear-gradient(180deg,transparent,var(--color-bg))]"
      />

      {/* ---------- floating glass chips ---------- */}
      <motion.div
        style={{ y: floatY }}
        className="pointer-events-none absolute inset-0 z-[2] hidden lg:block"
      >
        <FloatCard className="left-[5%] top-[24%]" delay={0.7}>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[13px] font-medium text-ink">
              Deployed to production
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-3">Build passed · 2.1s</p>
        </FloatCard>

        <FloatCard className="right-[7%] top-[32%]" delay={1.05}>
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-brand-2" />
            <span className="text-[13px] font-medium text-ink">
              AI copilot · online
            </span>
          </div>
        </FloatCard>

        <FloatCard className="bottom-[18%] right-[13%]" delay={1.3}>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl btn-brand text-white">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-ink">99.98%</p>
              <p className="text-[11px] text-ink-3">uptime this quarter</p>
            </div>
          </div>
        </FloatCard>
      </motion.div>

      {/* ---------- content ---------- */}
      <Container className="relative z-10">
        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          {hero.badge && (
            <motion.div variants={item}>
              <span className="group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-2 pr-4 text-xs font-medium text-ink-2 backdrop-blur transition-colors hover:border-brand-2/40">
                <span className="inline-flex items-center gap-1.5 rounded-full btn-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                  <Sparkles className="h-3 w-3" />
                  New
                </span>
                <span className="uppercase tracking-[0.14em]">{hero.badge}</span>
              </span>
            </motion.div>
          )}

          {(hero.titleLead || hero.titleHighlight) && (
            <motion.h1
              variants={item}
              className="mt-8 text-balance text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.03em] min-[390px]:text-5xl sm:text-6xl md:text-7xl"
            >
              {hero.titleLead && (
                <span className="text-ink-gradient">
                  <WordReveal text={hero.titleLead} delay={0.25} />{" "}
                </span>
              )}
              {hero.titleHighlight && (
                <span className="relative text-brand-gradient">
                  <WordReveal text={hero.titleHighlight} delay={0.45} />
                  {/* hand-drawn style underline sweep */}
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.1, delay: 1.05, ease: EASE }}
                    className="absolute -bottom-1 left-0 block h-[3px] w-full origin-left rounded-full bg-linear-to-r from-brand-2 via-brand-3 to-transparent"
                  />
                </span>
              )}
            </motion.h1>
          )}

          {hero.subtitle && (
            <motion.p
              variants={item}
              className="mt-7 max-w-xl text-balance text-base leading-relaxed text-ink-2 sm:mt-8 sm:text-lg"
            >
              {hero.subtitle}
            </motion.p>
          )}

          {(showPrimary || showSecondary) && (
            <motion.div
              variants={item}
              className="mt-10 flex w-full flex-col items-stretch gap-3 min-[390px]:w-auto min-[390px]:items-center sm:flex-row"
            >
              {showPrimary && (
                <Button
                  href={hero.primaryHref}
                  size="lg"
                  magnetic
                  withArrow
                  className="w-full shadow-[var(--shadow-brand-lg)] sm:w-auto"
                >
                  {hero.primaryLabel}
                </Button>
              )}
              {showSecondary && (
                <Button
                  href={hero.secondaryHref}
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {hero.secondaryLabel}
                </Button>
              )}
            </motion.div>
          )}

          {/* ---------- trust bar ---------- */}
          <motion.div
            variants={item}
            className="mt-12 flex flex-col items-center gap-5"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
              {faces.length > 0 && <AvatarStack items={faces} />}
              <span className="flex flex-col items-start">
                <Stars />
                <span className="mt-0.5 text-xs text-ink-3">
                  Trusted by founders and product teams worldwide
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {proof.map((stat) => (
                <span
                  key={stat.id}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-ink-2 backdrop-blur"
                >
                  <span className="font-display text-sm font-bold text-ink">
                    {stat.value}
                    {stat.suffix}
                  </span>
                  {stat.label}
                </span>
              ))}
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-ink-2 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-3" />
                Senior-led delivery
              </span>
            </div>
          </motion.div>
        </motion.div>
      </Container>

      {/* ---------- scroll cue ---------- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-7 z-10 hidden justify-center md:flex"
      >
        <span className="flex h-11 w-7 items-start justify-center rounded-full border border-white/15 pt-2">
          <ArrowDown className="animate-scroll-cue h-3.5 w-3.5 text-ink-3" />
        </span>
      </div>
    </section>
  );
}

function FloatCard({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.85, ease: EASE, delay }}
      className={`absolute ${className}`}
    >
      <div className="animate-float">
        <div className="glass rounded-2xl px-4 py-3 shadow-[var(--shadow-e3)]">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
