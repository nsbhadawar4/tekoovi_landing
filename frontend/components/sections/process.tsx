"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { ProcessStep } from "@/backend/types";
import { Carousel } from "@/components/ui/carousel";
import { SectionHeading, Section, Container } from "@/components/ui/section";

/**
 * Two readings of the same steps:
 *  - phones get a vertical rail whose progress line fills as you scroll
 *  - desktop gets a horizontal, swipeable stepper — a process should feel like
 *    forward motion, not a list
 */
export function Process({ steps }: { steps: ProcessStep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <Section id="process" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/3 mx-auto h-72 w-3/4 max-w-4xl rounded-full bg-brand/8 blur-[130px]"
      />

      <Container className="relative">
        <SectionHeading
          eyebrow="How we work"
          title={<>A process engineered for momentum</>}
          description="Deliberate stages that take you from a fuzzy idea to a scaled, supported product — with visibility at every step."
        />
      </Container>

      {/* ---------------- desktop: horizontal stepper ---------------- */}
      <Container className="relative mt-14 hidden lg:block">
        <div className="relative">
          {/* rail behind the cards */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-[46px] h-px bg-linear-to-r from-transparent via-white/12 to-transparent"
          />
          <Carousel
            label="Our process, step by step"
            slideClass="basis-[calc(33.333%-1rem)]"
            showProgress
            slides={steps.map((stage, i) => (
              <StepCard key={stage.id} stage={stage} index={i} />
            ))}
          />
        </div>
      </Container>

      {/* ---------------- mobile: scroll-lit timeline ---------------- */}
      <Container className="relative lg:hidden">
        <div ref={ref} className="relative mx-auto mt-12 max-w-2xl">
          <div className="absolute bottom-2 left-4 top-2 w-px bg-white/10" />
          <motion.div
            style={{ scaleY }}
            className="absolute bottom-2 left-4 top-2 w-px origin-top bg-linear-to-b from-brand-2 via-brand to-brand-3"
          />

          <div className="flex flex-col gap-6">
            {steps.map((stage, i) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative pl-12"
              >
                <span className="absolute left-4 top-7 z-10 grid h-3.5 w-3.5 -translate-x-1/2 place-items-center rounded-full border-2 border-brand-2 bg-bg shadow-[0_0_14px_2px_rgba(138,92,255,0.55)]" />
                <StepCard stage={stage} index={i} />
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function StepCard({ stage, index }: { stage: ProcessStep; index: number }) {
  return (
    <article className="group card-lux lift sheen relative h-full overflow-hidden rounded-[22px] p-6 sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-brand/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* oversized ghost number */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-6 right-2 font-display text-[5.5rem] font-bold leading-none text-white/[0.04] transition-colors duration-500 group-hover:text-brand-3/15"
      >
        {stage.step || String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative flex items-center gap-3">
        {stage.step && (
          <span className="grid h-9 min-w-9 place-items-center rounded-xl border border-brand-2/30 bg-brand/10 px-2 font-display text-sm font-bold text-brand-3 transition-all duration-500 group-hover:border-transparent group-hover:bg-brand group-hover:text-white">
            {stage.step}
          </span>
        )}
        <span
          aria-hidden
          className="h-px flex-1 bg-linear-to-r from-white/15 to-transparent"
        />
      </div>

      {stage.title && (
        <h3 className="relative mt-5 font-display text-lg font-semibold text-ink transition-colors duration-300 group-hover:text-brand-3">
          {stage.title}
        </h3>
      )}
      {stage.description && (
        <p className="relative mt-2.5 text-sm leading-relaxed text-ink-2">
          {stage.description}
        </p>
      )}
    </article>
  );
}
