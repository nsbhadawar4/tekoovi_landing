"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { PROCESS } from "@/lib/data";
import { SectionHeading, Section, Container } from "@/components/ui/section";

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <Section id="process">
      <Container>
        <SectionHeading
          eyebrow="How we work"
          title={<>A process engineered for momentum</>}
          description="Seven deliberate stages that take you from a fuzzy idea to a scaled, supported product — with visibility at every step."
        />

        <div ref={ref} className="relative mx-auto mt-16 max-w-3xl">
          {/* rail */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-white/10 md:left-1/2" />
          <motion.div
            style={{ scaleY }}
            className="absolute left-4 top-2 bottom-2 w-px origin-top bg-linear-to-b from-brand-2 via-brand to-brand-3 md:left-1/2"
          />

          <div className="flex flex-col gap-10">
            {PROCESS.map((stage, i) => (
              <TimelineRow key={stage.step} index={i}>
                <div className="card-hairline rounded-2xl p-6 transition-colors duration-300 hover:border-white/15">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-sm font-bold text-brand-3">
                      {stage.step}
                    </span>
                    <h3 className="font-display text-lg font-semibold text-ink">
                      {stage.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">
                    {stage.description}
                  </p>
                </div>
              </TimelineRow>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function TimelineRow({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const isLeft = index % 2 === 0;
  return (
    <div className="relative pl-12 md:grid md:grid-cols-2 md:gap-10 md:pl-0">
      {/* node */}
      <div className="absolute left-4 top-6 z-10 -translate-x-1/2 md:left-1/2">
        <span className="block h-3.5 w-3.5 rounded-full border-2 border-brand-2 bg-bg shadow-[0_0_14px_2px_rgba(138,92,255,0.55)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={
          isLeft
            ? "md:col-start-1 md:pr-4 md:text-right"
            : "md:col-start-2 md:pl-4"
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
