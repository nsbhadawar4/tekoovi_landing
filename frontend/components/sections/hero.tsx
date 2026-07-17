"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { Sparkles } from "lucide-react";
import { useRef } from "react";
import type { Hero as HeroContent } from "@/backend/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuroraBlobs, GridBackdrop } from "@/components/ui/backgrounds";
import { Container } from "@/components/ui/section";

const EASE = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
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

export function Hero({ hero }: { hero: HeroContent }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const floatY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-32 pb-12"
    >
      {hero.backgroundImage && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center top-[62px] h-[580px]"
            style={{ backgroundImage: `url(${hero.backgroundImage})`}}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,14,0.52),rgba(6,6,14,0.84))]"
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
            "radial-gradient(500px circle at var(--sx, 50%) var(--sy, 30%), rgba(108,59,255,0.10), transparent 70%)",
        }}
      />

      {/* floating UI elements */}
      <motion.div
        style={{ y: floatY }}
        className="pointer-events-none absolute inset-0 z-[2] hidden lg:block"
      >
        <FloatCard className="left-[6%] top-[26%]" delay={0.6} floatClass="animate-float">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]" />
            <span className="text-[13px] font-medium text-ink">
              Deployed to production
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-3">Build passed · 2.1s</p>
        </FloatCard>

        <FloatCard
          className="bottom-[16%] right-[12%]"
          delay={1}
          floatClass="animate-float"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-brand-2" />
            <span className="text-[13px] font-medium text-ink">
              AI copilot · online
            </span>
          </div>
        </FloatCard>
      </motion.div>

      {/* content */}
      <Container className="relative z-10">
        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.div variants={item}>
            <Badge>{hero.badge}</Badge>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-7 text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl"
          >
            <span className="text-ink-gradient">{hero.titleLead}</span>
            <span className="text-brand-gradient">{hero.titleHighlight}</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 max-w-xl text-balance text-lg leading-relaxed text-ink-2"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Button href={hero.primaryHref} size="lg" magnetic withArrow>
              {hero.primaryLabel}
            </Button>
            <Button href={hero.secondaryHref} size="lg" variant="secondary">
              {hero.secondaryLabel}
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

function FloatCard({
  children,
  className,
  delay,
  floatClass,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
  floatClass: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      className={`absolute ${className}`}
    >
      <div className={floatClass}>
        <div className="glass rounded-2xl px-4 py-3 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.8)]">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
